# Chat de la clase

Chat grupal con Node.js + Express. Frontend y API se sirven desde el mismo servidor.

## Ejecutar en local
    npm install
    npm start
    # abrir http://localhost:3000

## Endpoints
- GET  /mensajes?desde=ID  -> mensajes (opcionalmente solo los nuevos)
- POST /mensaje            -> { usuario, mensaje }
- GET  /salud              -> comprobación de estado

## Despliegue en Azure App Service (Linux)
1. Crear un App Service: Runtime Node 18+ (o 20), Linux.
2. Subir el código (GitHub Actions, `az webapp up` o ZIP deploy).
   Comando de ejemplo desde esta carpeta:
       az webapp up --name <nombre-unico> --runtime "NODE:20-lts" --sku B1 --location brazilsouth
3. En Configuración > Variables de entorno agregar `DATA_DIR=/home/data`
   (así el historial persiste entre reinicios y despliegues).
4. Abrir https://<nombre-unico>.azurewebsites.net

## Despliegue en AWS (Elastic Beanstalk)
    eb init -p node.js chat-api
    eb create chat-api-env
    eb open
(Azure y AWS inyectan la variable PORT; el servidor ya la usa.)

## Despliegue por ZIP (portal o CLI)
El ZIP tiene `server.js` y `package.json` en la raíz. Configura en la app
`SCM_DO_BUILD_DURING_DEPLOYMENT=true` para que Azure ejecute `npm install`, y luego:

    az webapp deploy --resource-group <grupo> --name <app> --src-path chat-api-final.zip --type zip
