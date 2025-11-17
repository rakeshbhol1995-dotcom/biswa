# --- ପର୍ଯ୍ୟାୟ ୧: ତିଆରି (ବିଲ୍ଡ) ପାଇଁ ପ୍ରସ୍ତୁତି ---
# ନୋଡ୍ (Node) ର ଏକ ଛୋଟ ଇମେଜ୍ ବ୍ୟବହାର କରୁଛୁ। 
FROM node:20-slim as builder

# କଣ୍ଟେନର ଭିତରେ କାମ କରିବା ପାଇଁ ଫୋଲଡର ତିଆରି କରୁଛୁ
WORKDIR /app

# ଆପଣଙ୍କର ସମସ୍ତ ଫାଇଲ୍ (html, css, js) କୁ କଣ୍ଟେନର ଭିତରକୁ କପି କରୁଛୁ
COPY index.html /app/
COPY receipt.html /app/
COPY script.js /app/
COPY styles.css /app/


# --- ପର୍ଯ୍ୟାୟ ୨: ଅନ୍ତିମ ଇମେଜ୍ (ରନ୍ ପାଇଁ) ---
# ଷ୍ଟାଟିକ୍ କଣ୍ଟେଣ୍ଟ୍ ସର୍ଭ୍ କରିବା ପାଇଁ ସବୁଠାରୁ ଛୋଟ Nginx ଇମେଜ୍ ବ୍ୟବହାର କରୁଛୁ
FROM nginx:stable-alpine  

# ଆମର ନିଜସ୍ୱ Nginx ସେଟିଙ୍ଗ୍ ଫାଇଲ୍ କୁ କପି କରୁଛୁ
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ପ୍ରଥମ ପର୍ଯ୍ୟାୟରୁ ପ୍ରସ୍ତୁତ ଥିବା ଆପଣଙ୍କ ୱେବସାଇଟ୍ ଫାଇଲ୍ ଗୁଡ଼ିକୁ Nginx ର ମୁଖ୍ୟ ୱେବ୍ ଫୋଲଡରକୁ କପି କରୁଛୁ
COPY --from=builder /app /usr/share/nginx/html

# ପୋର୍ଟ ୮୦ ରେ ଚଳାଇବାକୁ ପ୍ରସ୍ତୁତ କରୁଛୁ
EXPOSE 80
