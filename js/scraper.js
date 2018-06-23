const fs = require('fs');
const scrapeIt = require("scrape-it")
var dir = '../data';

// check if the data folder does not exist
if(!fs.existsSync(dir)) {
    // console.log("Does not exist");
    // creates folder
    fs.mkdirSync(dir)
} else {
    // console.log("Exists");
}

var linkData = {};
var tShirtData = [];

scrapeIt("http://shirts4mike.com/shirts.php", {
    // get the links of the tShirts
    tshirts: {
        listItem: ".products li",
        data: {
            shirtLink: {     
                selector: "a",
                attr: "href"}
            }
    }
}).then(({ data, response }) => {
    // console.log(`Status Code: ${response.statusCode}`)
    // console.log(data)

    // display error message is status code is 404
    if(response.statusCode == 404)
    {
        console.log(`There’s been a 404 error. Cannot connect to http://shirts4mike.com.`)
    } else {
        linkData = data;
        // console.log(linkData.tshirts[0].shirtLink);

        var shirtData = linkData.tshirts;

        shirtData.forEach(element => {
            //scrape price, title, url and img url
            scrapeIt("http://shirts4mike.com/" + element.shirtLink, {
            // get the links of the tShirts
                title: ".shirt-details h1",
                price: ".price",
                imgData: {
                    selector: ".shirt-picture img",
                    attr: "src"
                }
        
            }).then(({ data, response }) => {
                // console.log(`Status Code: ${response.statusCode}`)
                // console.log(data)
                tShirtData.push(data);
            })
        });  
    } 
})
