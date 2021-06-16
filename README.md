# sneaky-uploader

## Start the app
Run the app, upload server will be exposed to http://localhost:5555  
You can scan the QR Code for server configs

---

## Get API server status

`GET` `http://localhost:5555/status` for server status
```json
{"code":200, "pcName":"garand.local"}
```

## Upload files
`POST` `http://localhost:5555/images` with `multipart/form-data` body to upload files  
(multiple file uploading is also supported)

Remember to provide `Authorization` header as well:  
<img width="1296" alt="Screen Shot 2021-06-16 at 20 15 42" src="https://user-images.githubusercontent.com/39024711/122225884-a834e600-cedf-11eb-8120-99c4d7197719.png">

The `JWT` payload must have `deviceId` & `deviceName` fields

---

## Web UI for testing
You can also find an upload form at [http://localhost:5555/](http://localhost:5555/) for testing purpose. 

<img width="612" alt="Screen Shot 2021-06-15 at 18 08 41" src="https://user-images.githubusercontent.com/39024711/122042749-bbbf4e80-ce04-11eb-9f52-e050f6d21617.png">
