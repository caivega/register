npm run build:wasm
npm run build
grep -rl '/assets' ./dist | sort | uniq | xargs perl -e"s/\/assets/\.\/assets/g" -pi
rm -rf ./register.zip && cd dist/ && zip -r ../register.zip ./ && cd ../
