#!/bin/sh
# CSS/JS를 바꾼 뒤 실행: HTML의 ?v= 값을 갱신해 브라우저가 예전 캐시 파일과 섞어 쓰지 않게 한다.
cd "$(dirname "$0")/.." || exit 1
v=$(date +%Y%m%d%H%M)
for f in index.html ko/*.html en/*.html; do
  sed -i '' -E "s/\.(css|js)(\?v=[0-9]+)?\"/.\1?v=$v\"/g" "$f"
done
echo "v=$v"
