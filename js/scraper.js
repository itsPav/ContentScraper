const fs = require('fs');
const scrapeIt = require("scrape-it")
const Json2csvParser = require('json2csv').Parser;

// date and time
const now = new Date();
const time = now.toLocaleTimeString();

// data folder location and csv file name
const dir = './data';
const csvFile = dir + "/" + now.toLocaleDateString() + ".csv";
const logFile = 'scraper-error.log';

console.log(csvFile);
console.log(time);

// check if the data folder does not exist
if(!fs.existsSync(dir)) {
    console.log("Folder does not exist, creating data folder.");
    // creates folder
    fs.mkdirSync(dir)
} else {
    console.log("Folder exists");
}

var linkData = {};
const fields = ['Title', 'Price', 'ImageURL', 'URL', 'Time'];
var tShirtData = [];
var shirtData;

// scrape the main shirts page for the list items and the shirt links
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
    
    // display error message if not 200
    if(response.statusCode != 200)
    {
        // error check function
        errorCheck(response.statusCode);
    }
    // after getting data, go to each shirt link and scrape the page 
    else {
        linkData = data;
        // console.log(linkData.tshirts[0].shirtLink);

        shirtData = linkData.tshirts;

        shirtData.forEach(element => {
            //scrape price, title, url and img url
            scrapeIt("http://shirts4mike.com/" + element.shirtLink, {
            // get the links of the tShirts
                 Title: {
                    selector: ".shirt-picture img",
                    attr: "alt"
                 }
                ,ImageURL: {
                    selector: ".shirt-picture img",
                    attr: "src"
                }
                ,Price: ".price"

            }).then(({ data, response }) => {
                
                errorCheck(response.statusCode);

                // add url of page and date to the data
                data.Time = time;
                data.URL = "http://shirts4mike.com/" + element.shirtLink;

                // console.log(`Status Code: ${response.statusCode}`)
                // console.log(data)
                tShirtData.push(data);

                if(tShirtData.length == shirtData.length) {
                    try {
                        const parser = new Json2csvParser({ fields });
                        const csv = parser.parse(tShirtData);
                        console.log(csv);

                        // check if csv file exists with same name
                        if(!fs.existsSync(csvFile)) {
                        // add the csv file to the data folder
                            fs.writeFile(csvFile, csv, function (err) {
                                if (err) throw err;
                                console.log('Saved!');
                            });
                        } else {
                            // console.log("Exists");
                            // update the file with new info
                            fs.writeFile(csvFile, csv, function (err) {
                                if (err) throw err;
                                console.log('Overwritten!');
                            });
                        }

                    } catch (err) {
                        console.error(err);
                    }  
                }
            })
        })
    }
})

// log the error to file
// write to log file
function errorCheck(status) {
if(status != 200)
    {
        let errorMessage = '[' + Date() + `] <There’s been a ${status} error. Cannot connect to http://shirts4mike.com.>\n`;
        console.log(errorMessage);

        fs.appendFileSync(logFile, errorMessage, (err) => {
            if (err) throw err;
            console.log('Error logged');
        });
    }
}