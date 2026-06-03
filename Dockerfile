# Gunakan base image Node.js versi 20 (karena chromadb butuh Node >= 20)
FROM node:20-bullseye-slim

# Buat direktori aplikasi di dalam container
WORKDIR /usr/src/app

# Salin package.json dan package-lock.json
COPY package*.json ./

# Tingkatkan timeout NPM dan instal dependensi produksi (menggunakan --omit=dev)
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm ci --omit=dev

# Salin seluruh kode proyek, termasuk folder local_model_v2 yang berisi model AI
COPY . .

# Ekspos port aplikasi
EXPOSE 3000

# Perintah utama untuk menjalankan server
CMD [ "node", "index.js" ]
