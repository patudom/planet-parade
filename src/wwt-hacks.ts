// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

/* eslint-disable */

import {
  Annotation,
  Color,
  Constellations,
  Coordinates,
  GlyphCache,
  Grids,
  Planets,
  RenderTriangle,
  Settings,
  SpaceTimeController,
  Text3d,
  Text3dBatch,
  Texture,
  Tile,
  TileCache,
  TourPlayer,
  Vector3d,
  WebFile,
  WWTControl,
} from "@wwtelescope/engine";

import { drawHorizon, drawSky } from "./horizon_sky";
import { makeTextOverlays } from "./text";

export function resetAltAzGridText() {
  Grids._altAzTextBatch = null;
}

export function makeAltAzGridText() {
  if (Grids._altAzTextBatch == null) {
    const glyphHeight = 70;
    Grids._altAzTextBatch = new Text3dBatch(glyphHeight);
    const sign = SpaceTimeController.get_location().get_lat() < 0 ? -1 : 1;
    const alt = 0.03 * sign;
    const up = Vector3d.create(0, sign, 0);
    const directions = [
      [[0, alt, -1], "N"],
      [[-sign, alt, 0], "E"],
      [[0, alt, 1], "S"],
      [[sign, alt,  -0.0095], "V"],
      [[sign, alt,  0.0095], "V"]
    ]
    directions.forEach(([v, text]) => {
      Grids._altAzTextBatch.add(new Text3d(Vector3d.create(...v), up, text, 75, 0.00018));
    });
  }
}

const GLYPH_CACHE = function(): GlyphCache {
  const cache = new GlyphCache();
  let href = window.location.href;
  if (href.endsWith("/")) {
    href = href.slice(0, href.length - 1);
  }
  const imageUrl = `${href}/glyphs2.png`;
  const xmlUrl = `${href}/glyphs2.xml`;
  cache._texture = Texture.fromUrl(imageUrl);
  cache._webFile = new WebFile(xmlUrl);
  cache._webFile.onStateChange = GlyphCache.prototype._glyphXmlReady.bind(cache);
  cache._webFile.send();

  return cache;
}();

export function useCustomGlyphs(batch: Text3dBatch) {
  batch._glyphCache = GLYPH_CACHE;
  batch.prepareBatch();
}

export function renderOneFrame(showHorizon=true,
                               showSky=true) {
  if (this.renderContext.get_backgroundImageset() != null) {
    this.renderType = this.renderContext.get_backgroundImageset().get_dataSetType();
  } else {
    this.renderType = 2;
  }

  var sizeChange = false;
  if (this.canvas.width !== this.canvas.parentNode.clientWidth) {
    this.canvas.width = this.canvas.parentNode.clientWidth;
    sizeChange = true;
  }
  if (this.canvas.height !== this.canvas.parentNode.clientHeight) {
    this.canvas.height = this.canvas.parentNode.clientHeight;
    sizeChange = true;
  }
  if (sizeChange && this.explorer != null) {
    this.explorer.refresh();
  }
  if (this.canvas.width < 1 || this.canvas.height < 1) {
    return;
  }
  if (sizeChange) {
    this._crossHairs = null;
  }
  Tile.lastDeepestLevel = Tile.deepestLevel;
  RenderTriangle.width = this.renderContext.width = this.canvas.width;
  RenderTriangle.height = this.renderContext.height = this.canvas.height;
  Tile.tilesInView = 0;
  Tile.tilesTouched = 0;
  Tile.deepestLevel = 0;
  SpaceTimeController.set_metaNow(new Date());
  if (this.get__mover() != null) {
    SpaceTimeController.set_now(this.get__mover().get_currentDateTime());
    Planets.updatePlanetLocations(this.get_solarSystemMode());
    if (this.get__mover() != null) {
      const newCam = this.get__mover().get_currentPosition();
      this.renderContext.targetCamera = newCam.copy();
      this.renderContext.viewCamera = newCam.copy();
      if (this.renderContext.space && Settings.get_active().get_galacticMode()) {
        const gPoint = Coordinates.j2000toGalactic(newCam.get_RA() * 15, newCam.get_dec());
        this.renderContext.targetAlt = this.renderContext.alt = gPoint[1];
        this.renderContext.targetAz = this.renderContext.az = gPoint[0];
      }
      else if (this.renderContext.space && Settings.get_active().get_localHorizonMode()) {
        const currentAltAz = Coordinates.equitorialToHorizon(Coordinates.fromRaDec(newCam.get_RA(), newCam.get_dec()), SpaceTimeController.get_location(), SpaceTimeController.get_now());
        this.renderContext.targetAlt = this.renderContext.alt = currentAltAz.get_alt();
        this.renderContext.targetAz = this.renderContext.az = currentAltAz.get_az();
      }
      if (this.get__mover().get_complete()) {
        WWTControl.scriptInterface._fireArrived(this.get__mover().get_currentPosition().get_RA(), this.get__mover().get_currentPosition().get_dec(), WWTControl.singleton.renderContext.viewCamera.zoom);
        this.set__mover(null);
        this._notifyMoveComplete();
      }
    }
  }
  else {
    SpaceTimeController.updateClock();
    Planets.updatePlanetLocations(this.get_solarSystemMode());
    this._updateViewParameters();
  }
  this.renderContext.clear();

  this.renderContext.setupMatricesSpace3d(this.renderContext.width, this.renderContext.height);
  this.renderContext.drawImageSet(this.renderContext.get_backgroundImageset(), 100);
  if (this.renderContext.get_foregroundImageset() != null) {
    if (this.renderContext.get_foregroundImageset().get_dataSetType() !== this.renderContext.get_backgroundImageset().get_dataSetType()) {
      this.renderContext.set_foregroundImageset(null);
    }
    else {
      if (this.renderContext.viewCamera.opacity !== 100 && this.renderContext.gl == null) {
        if (this._foregroundCanvas.width !== this.renderContext.width || this._foregroundCanvas.height !== this.renderContext.height) {
          this._foregroundCanvas.width = this.renderContext.width;
          this._foregroundCanvas.height = this.renderContext.height;
        }
        var saveDevice = this.renderContext.device;
        this._fgDevice.clearRect(0, 0, this.renderContext.width, this.renderContext.height);
        this.renderContext.device = this._fgDevice;
        this.renderContext.drawImageSet(this.renderContext.get_foregroundImageset(), 100);
        this.renderContext.device = saveDevice;
        this.renderContext.device.save();
        this.renderContext.device.globalAlpha = this.renderContext.viewCamera.opacity / 100;
        this.renderContext.device.drawImage(this._foregroundCanvas, 0, 0);
        this.renderContext.device.restore();
      }
      else {
        this.renderContext.drawImageSet(this.renderContext.get_foregroundImageset(), this.renderContext.viewCamera.opacity);
      }
    }
  }
  if (this.uiController != null) {
    this.uiController.render(this.renderContext);
  }
  else {
    if (showSky) {
      drawSky(this.renderContext, { opacity: 0.95, color: "#4190ED" });
    }
    Annotation.prepBatch(this.renderContext);
    for (const item of this._annotations) {
      item.draw(this.renderContext);
    }
    Annotation.drawBatch(this.renderContext);
    if ((Date.now() - this._lastMouseMove) > 400) {
      var raDecDown = this.getCoordinatesForScreenPoint(this._hoverTextPoint.x, this._hoverTextPoint.y);
      this._annotationHover(raDecDown.x, raDecDown.y, this._hoverTextPoint.x, this._hoverTextPoint.y);
      this._lastMouseMove = new Date(2100, 1, 1);
    }
    if (this._hoverText) {
      this._drawHoverText(this.renderContext);
    }
  }

  for (const imageset in this.renderContext.get_catalogHipsImagesets()) {
    if (imageset.get_hipsProperties().get_catalogSpreadSheetLayer().enabled && imageset.get_hipsProperties().get_catalogSpreadSheetLayer().lastVersion === imageset.get_hipsProperties().get_catalogSpreadSheetLayer().get_version()) {
      this.renderContext.drawImageSet(imageset, 100);
    }
  }
  this.constellation = Constellations.containment.findConstellationForPoint(this.renderContext.viewCamera.get_RA(), this.renderContext.viewCamera.get_dec());
  Planets.drawPlanets(this.renderContext, 1);
  this._drawSkyOverlays();

  this._planetTextOverlays = makeTextOverlays();
  useCustomGlyphs(this._planetTextOverlays);
  this._planetTextOverlays.viewTransform = Grids._altAzTextBatch?.viewTransform;
  this._planetTextOverlays.draw(this.renderContext, 1, Color.fromArgb(255, 255, 255, 255));
  console.log(this._planetTextOverlays);
  console.log([this._planetTextOverlays.draw, this.renderContext, Color.fromArgb(255, 255, 255, 255)]);

  if (showHorizon) {
    drawHorizon(this.renderContext, { opacity: 0.95, color: "#01362C" });
  }

  const worldSave = this.renderContext.get_world();
  const viewSave = this.renderContext.get_view();
  const projSave = this.renderContext.get_projection();
  if (Settings.get_current().get_showCrosshairs()) {
    this._drawCrosshairs(this.renderContext);
  }

  const tilesAllLoaded = !TileCache.get_queueCount();
  this.renderContext.setupMatricesOverlays();
  this._fadeFrame();
  this._frameCount++;
  TileCache.decimateQueue();
  TileCache.processQueue(this.renderContext);
  Tile.currentRenderGeneration++;
  if (!TourPlayer.get_playing()) {
    this.set_crossFadeFrame(false);
  }
  this.renderContext.set_world(worldSave);
  this.renderContext.set_view(viewSave);
  this.renderContext.set_projection(projSave);
  const now = Date.now();
  const ms = now - this._lastUpdate;
  if (ms > 1000) {
    this._lastUpdate = now;
    this._frameCount = 0;
    RenderTriangle.trianglesRendered = 0;
    RenderTriangle.trianglesCulled = 0;
  }
  if (this.capturingVideo) {
    if ((this.dumpFrameParams != null) && (!this.dumpFrameParams.waitDownload || tilesAllLoaded)) {
      this.captureFrameForVideo(this._videoBlobReady, this.dumpFrameParams.width, this.dumpFrameParams.height, this.dumpFrameParams.format);
      SpaceTimeController.nextFrame();
    }
    if (SpaceTimeController.get_doneDumping()) {
      SpaceTimeController.frameDumping = false;
      SpaceTimeController.cancelFrameDump = false;
      this.capturingVideo = false;
    }
  }
}
