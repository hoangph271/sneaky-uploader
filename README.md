# sneaky-uploader

Run the app, upload server will be exposed to http://localhost:8081  
You can scan the QR Code for server configs

---

`GET` `http://localhost:8081/status` for server status
```json
{"code":200, "pcName":"garand.local"}
```

`POST` `http://localhost:8081/images` with `multipart/form-data` body to upload files  
(multiple file uploading is also supported)
