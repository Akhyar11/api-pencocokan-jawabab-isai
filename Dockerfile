# Gunakan base image Node.js yang stabil
FROM node:18-bullseye-slim

# Buat direktori aplikasi di dalam container
WORKDIR /usr/src/app

# Salin package.json dan package-lock.json
COPY package*.json ./

# Instal hanya dependensi produksi agar image lebih ringan
RUN npm ci --only=production

# Salin seluruh kode proyek, termasuk folder local_model_v2 yang berisi model AI
COPY . .

# Ekspos port aplikasi
EXPOSE 3000

# Perintah utama untuk menjalankan server
CMD [ "node", "index.js" ]
