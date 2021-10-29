### To run

```
npm install
npm start
```

##### Also include The Blue Alliance API key.

1. Get your API key from [The Blue Alliance](https://www.thebluealliance.com/account)
2. Add a file in the project directory called ".env.local"
3. In that file add the following code

```
REACT_APP_TBA_KEY=your key
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

_changed to not use firebase functions, this might not be needed unless we change back_

```
firebase functions:config:get
firebase functions:config:set tba.id="key"
```

### Visit Website

[Click this link](https://mvrt-super-scout.web.app/)
