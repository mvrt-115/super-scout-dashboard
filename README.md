### To run

```
npm install
npm start
```

### To Deploy

Install firebase tools if you haven't already

```
npm install firebase-tools -g
```

Log in, build, and deploy (To deploy, the account that you login with has to be a collaborator on mvrt-super-scout firebase project)

```
firebase login
npm run build
firebase deploy --only hosting:mvrt-super-scout
firebase deploy --only functions
```

### List Environment Variables

```
firebase functions:config:get
firebase functions:config:set tba.id="key"
```

### Visit Website

[Click this link](https://mvrt-super-scout.web.app/)
