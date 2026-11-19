import test from "node:test";
import assert from "node:assert/strict";
import { calculateTriangleConnector } from "../shared/svg-utils.js";

test("triangle spans actual panel height and targets node center", () => {
  const panelRect = { left: 100, right: 540, top: 105, height: 559 };
  const nodeRect = { left: 690, top: 330, width: 40, height: 40 };
  const overlayRect = { left: 0, top: 0 };
  const connector = calculateTriangleConnector({ nodeRect, panelRect, overlayRect });
  assert.equal(connector.height, panelRect.height);
  assert.deepEqual(connector.points[0], [0, 0]);
  assert.deepEqual(connector.points[1], [0, panelRect.height]);
  assert.deepEqual(connector.points[2], [connector.width, 245]);
});
