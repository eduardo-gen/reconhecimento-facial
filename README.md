# Facegle
Site de rastreamento facial com MediaPipe Face Landmarker. Detecta até três faces, desenha 478 pontos por face e salva capturas manualmente em JSON no servidor (Cloudflare R2, binding BUCKET).

## Executar
Node.js 22.13 ou superior. Instale com `npm install` e execute `npm run dev`. Abra o endereço localhost informado. O R2 local é independente do armazenamento publicado. Em produção, use HTTPS.

## Uso
Autorize a análise das pessoas na câmera, clique em Iniciar câmera e permita acesso no navegador. Clique em Salvar análise para persistir imagem JPEG e coordenadas x/y/z. O banco mostra as 100 capturas mais recentes; cada arquivo pode ser consultado, exportado ou excluído. A exportação geral inclui os registros exibidos. Não há identificação de pessoas nem deduplicação por identidade.

O primeiro uso baixa o runtime MediaPipe 0.10.21 e o modelo do Google. O vídeo é processado no dispositivo; só as capturas salvas manualmente são enviadas ao servidor. A hospedagem é privada por padrão. Arquivos JSON são armazenados individualmente em `faces/<uuid>.json`, evitando sobrescritas entre capturas simultâneas.
