"""
8192px 원본 위성 이미지를 256px 타일로 슬라이싱.
줌 임계값(Leaflet zoom=0) 이상에서만 쓰는 단일 네이티브 레벨 타일이라
피라미드 전체를 만들 필요 없음 — 기존 2048px ImageOverlay가 축소 뷰를 담당하고
이 타일은 확대했을 때만 교체 투입된다(MapCanvas.tsx 참고).
마지막 행/열은 원본 크기가 256의 배수가 아니면 256px보다 작게 잘릴 수 있음
(8192/256=32로 딱 나눠떨어지므로 이번엔 발생 안 하지만 범용성 위해 처리해둠).

**Y축 파일명이 일반 이미지 행 번호(위→아래 0,1,2...)가 아니라 Leaflet 타일 인덱스임에
주의** — CRS.Simple의 좌표변환(`Transformation(1,0,-1,0)`)이 lat를 뒤집어서
point.y = -lat*scale로 계산하기 때문에, 우리 bounds([0,imageSizePx])가 lat 쪽 "위"(=이미지
상단, lat=imageSizePx)로 갈수록 Leaflet 타일 행 번호가 더 음수로 내려간다. 파일 상단행(0)이
Leaflet 행 `-rows`, 파일 하단행(rows-1)이 Leaflet 행 `-1`이 되도록 저장해야 TileLayer의
`{y}` 치환과 실제로 맞아떨어진다(X는 뒤집히지 않아 그대로 0..cols-1).

사용법: python3 tools/make-map-tiles.py <원본_8192px_이미지> frontend/public/maps/tiles/<slug>
"""
import sys
from pathlib import Path
from PIL import Image

TILE_SIZE = 256


def make_tiles(source_path: str, out_dir: str, quality: int = 85):
    img = Image.open(source_path).convert("RGB")
    w, h = img.size
    cols = (w + TILE_SIZE - 1) // TILE_SIZE
    rows = (h + TILE_SIZE - 1) // TILE_SIZE
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    count = 0
    for row in range(rows):
        for col in range(cols):
            left = col * TILE_SIZE
            top = row * TILE_SIZE
            right = min(left + TILE_SIZE, w)
            bottom = min(top + TILE_SIZE, h)
            tile = img.crop((left, top, right, bottom))
            leaflet_y = row - rows  # 위 독스트링 참고 — Leaflet의 뒤집힌 Y 인덱스로 저장
            tile.save(out / f"{col}_{leaflet_y}.webp", "WEBP", quality=quality)
            count += 1
    return cols, rows, count


if __name__ == "__main__":
    source, out_dir = sys.argv[1], sys.argv[2]
    cols, rows, count = make_tiles(source, out_dir)
    print(f"{cols}x{rows} = {count} tiles -> {out_dir}")
