# TWEB_Projet_2018
### Backend Node.js Server with use of github API


##### To run this backEnd server, you need to first do a 
```` npm install ````


##### 3 api call are possible: \n1) /user/:username where username is the github login of the one you want to stalk. \n2) //repo/:owner/:repo_name where owner is the github login of the repository owner and repo_name the name of the repository and 3) repo/:name if you don't know the owner of a repo and want the server to search for some possible matches.

##### this will install all the needed dependencies. Then you will need to configure your DataBase configuration. For this you will use the .env file that you need to create in order to run this server.