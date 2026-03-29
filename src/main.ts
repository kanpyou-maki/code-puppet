import { TrackerImpl } from "./tracker/TrackerImpl.js";
import { RendererImpl } from "./renderer/RendererImpl.js";
import { DefaultMapper } from "./mapper/DefaultMapper.js";
import { AVATAR_PARTS } from "./avatar/parts.js";

async function main(): Promise<void> {
  const canvas = document.getElementById("avatar-canvas") as HTMLCanvasElement;
  if (!canvas) throw new Error("#avatar-canvas が見つかりません");

  // --- 各モジュールを生成 ---
  const tracker = new TrackerImpl();
  const renderer = new RendererImpl();
  const mapper = new DefaultMapper();

  // --- Renderer 初期化 → パーツ読み込み ---
  await renderer.init(canvas);
  await renderer.loadParts(AVATAR_PARTS);

  // --- Tracker 開始（カメラ権限を要求） ---
  await tracker.start();

  // --- rAF メインループ ---
  // Tracker（非同期）と Renderer（同期）を latestFrame バッファ経由で疎結合にする
  function loop(): void {
    const frame = tracker.getLatestFrame();
    if (frame) {
      const transforms = mapper.apply(frame);
      for (const [id, transform] of transforms) {
        try {
          renderer.updatePart(id, transform);
        } catch (err) {
          // 存在しないパーツIDはスキップ（開発環境では警告を出す）
          if (import.meta.env.DEV) {
            console.warn(`[main] updatePart failed for "${id}":`, err);
          }
        }
      }
    }
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);

  // --- アンロード時のクリーンアップ ---
  window.addEventListener("beforeunload", () => {
    tracker.stop();
    renderer.destroy();
  });
}

main().catch((err) => {
  console.error("起動エラー:", err);
});
