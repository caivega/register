npm run build:wasm
npm run build
rm -rf ./register.zip && cd dist/ && zip -r ../register.zip ./ && cd ../
