# CherryPicking Mails Console
This extension for PureCloud by Genesys, allows to cherry pick untouched email interactions from any queue.
Using preview button mail interaction can be read without actually pick it up by a current user.
Each interaction can be pickup'ed or transferred to different user.
Transfer to ACD Queue is also possible but not implemented in this example.

## Installation
To install this app in your PureCloud org, first copy this repo into your own github account.
Next steps:
* Enable Github pages for your repository (Settings -> Github pages -> set Source to master branch)
* Create new Implicit Grant (Browser) OAuth Application in PureCloud
* Set Authorized redirect URIs to the GitHub page link created in previous steps (ex. https://szlaskidaniel.github.io/purecloud-cherrypick-mails/)
* Modify scripts/global.js config file and update there OAuth settings that match to your org (clientId + environment + redirectUrl, that match your github page link created in previous steps).
* create new Integration in PureCloud (Custom Client Application)
* in configuration tab point ApplicationURL path to your GitHub pages link (mine is https://szlaskidaniel.github.io/purecloud-cherrypick-mails/)
* save & refresh your settings

## misc
This solution is not meant to be installed on PRD env. \It's just POC that CherryPicking mail interactions is possible via custom API usage
Only untouched email interactions are visible via this solution.\
Images (attachments) are not scaled, so bigger could go beyond frame with preview window.





