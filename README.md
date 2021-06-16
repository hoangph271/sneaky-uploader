# sneaky-uploader

## Start the app
Run the app, upload server will be exposed to http://localhost:8081  
You can scan the QR Code for server configs

---

## Get API server status

`GET` `http://localhost:8081/status` for server status
```json
{"code":200, "pcName":"garand.local"}
```

## Upload files
`POST` `http://localhost:8081/images` with `multipart/form-data` body to upload files  
(multiple file uploading is also supported)

---

## Web UI for testing
You can also find an upload form at [http://localhost:8081/](http://localhost:8081/) for testing purpose. 

<img width="612" alt="Screen Shot 2021-06-15 at 18 08 41" src="https://user-images.githubusercontent.com/39024711/122042749-bbbf4e80-ce04-11eb-9f52-e050f6d21617.png">
