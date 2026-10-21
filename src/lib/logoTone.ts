import sharp from 'sharp';
import { LOGO_AREA, LOGO_DARK_THRESHOLD } from '@/lib/logo';

// 서버 전용 (sharp). 썸네일 이미지에서 로고 자리 평균 밝기를 재서 흰 로고를 쓸지 판단.
// 화면과 같게 정사각 cover 로 자른 뒤 LOGO_AREA 를 봄. 투명 부분은 썸네일 배경색(#F5F5F5)으로 채움.
const SIZE = 500;

export async function logoAreaTone(image: Buffer): Promise<{ brightness: number; white: boolean }> {
  const { data, info } = await sharp(image)
    .resize(SIZE, SIZE, { fit: 'cover' })
    .flatten({ background: '#F5F5F5' })
    .extract({
      left: Math.round(LOGO_AREA.left * SIZE),
      top: Math.round(LOGO_AREA.top * SIZE),
      width: Math.round(LOGO_AREA.width * SIZE),
      height: Math.round(LOGO_AREA.height * SIZE),
    })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let sum = 0;
  const n = info.width * info.height;
  for (let i = 0; i < n; i++) {
    sum += (0.2126 * data[i * 3] + 0.7152 * data[i * 3 + 1] + 0.0722 * data[i * 3 + 2]) / 255;
  }
  const brightness = sum / n;
  return { brightness, white: brightness < LOGO_DARK_THRESHOLD };
}
