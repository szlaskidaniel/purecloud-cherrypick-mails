# Cherry Picking Emails PureCloud UI

This site is meant to be embedded in Genesys PureCloud to allow authorized users to cherry pick waiting email interactions from any queue.
Using the preview button, an email interaction can be shown without actually picking it up.
Each email interaction can be picked up or transferred to different user or another ACD queue (not yet implemented in this example)

## Limitations

* **This solution is not meant to be installed in a production environment** 
* It is provided for demo purposes only
* Only waiting email interactions are visible via this solution
* ages (attachments) are not scaled, so bigger images could span beyond the preview window

## Deployment

If you do not want to make changes and simply want to test this site in your PureCloud organization, follow these steps:
* Create a new Integration in PureCloud (Custom Client Application)
  * In the `Details` tab, set a name for your application (e.g. Cherry Picking Emails)
  * In the `Configuration` tab, set the `Application URL` path to https://szlaskidaniel.github.io/purecloud-cherrypick-mails/
  * Set the `Application Category` to `contactCenterInsights`
  * In `Group Filtering`, select a group of users who will have access to this application. If you do not have groups, you will need to create one in `Admin`. This setting is mandatory.
* Click on `Save`
* In the `Details` tab, set the application to `Active` (top-right) and click on `Save` one more time (if needed)
* You may need to logout and log back in to view the app in the `Apps` menu in the top bar
* When you first access the application, you might see a pop up window flash quickly to log you in

## For developers/engineers

To install this app in your PureCloud org, first copy this repo into your own github account.
Next steps:
* Enable Github pages for your repository (Settings -> Github pages -> set Source to master branch)
* Create new Implicit Grant (Browser) OAuth Application in PureCloud
* Set Authorized redirect URIs to the GitHub page link created in previous steps (ex. https://szlaskidaniel.github.io/purecloud-cherrypick-mails/)
* Modify scripts/global.js config file and update there OAuth settings that match to your org (clientId + environment + redirectUrl, that match your github page link created in previous steps).
* Follow the steps above in the `Deployment` section to deploy the app in your own org
