import { apiUrl } from "./config.js";
console.log(apiUrl);


console.log("Start background worker.");
chrome.runtime.onInstalled.addListener(async () =>{
    await chrome.storage.local.set({
        urls: {example: "https://example.com/"},
        getIp: true,
        checkUrls: true,
        autocheckRemoute: true
    })
})


chrome.runtime.onStartup.addListener(async () =>{
    const { autocheckRemoute } = await chrome.storage.local.get("autocheckRemoute");
    // console.log("autocheck", autocheckRemoute);
    if (autocheckRemoute){
        setTimeout(()=>{
            chrome.action.setBadgeText({
                        text: "D. . .",
                    });
            chrome.action.setBadgeBackgroundColor({
                color: "green", 
            })
        }, 50);
    } else{
        // console.log("autocheck1", "OFF");
        setTimeout(()=>{
            chrome.action.setBadgeText({
                text: `OFF`,
            })
            chrome.action.setBadgeBackgroundColor({
                color: "lightgrey", 
            })
        }, 50);

    }
});


async function remouteCheck(details){
    try{
        console.log(details.url,"\nDirect status code: ", details.statusCode || details.error);
        // console.log(details);
        setTimeout(()=>{
            chrome.action.setBadgeText({
                text: `R. . .`,
                tabId: details.tabId
            });
            chrome.action.setBadgeBackgroundColor({
                    color: "#cc99ff",
                    tabId: details.tabId
            })
        },50); 
        const response = await fetch(`${apiUrl}`,{
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                requestUrl: details.url
            })
        });
        const responseJson = await response.json()
        console.log("Remote:", responseJson);
        if(response.ok && responseJson.statusCode && !responseJson.requestErr){
            setTimeout(()=>{
                chrome.action.setBadgeText({
                    text: `R${responseJson.statusCode}`,
                    tabId: details.tabId
                });
                chrome.action.setBadgeBackgroundColor({
                    color: "#0040ff",
                    tabId: details.tabId
            })
            },50); 
        } else if(response.ok && responseJson.statusCode && responseJson.requestErr){
            setTimeout(()=>{
                chrome.action.setBadgeText({
                    text: `P${responseJson.statusCode}`,
                    tabId: details.tabId
                });
                chrome.action.setBadgeBackgroundColor({
                    color: "#e67300",
                    tabId: details.tabId
                })
            },50); 
        } else {
            throw new Error("Bad response.");
        }
    } catch (err){
        console.error("Fetch or badge update failed:", err);
        setTimeout(()=>{
            chrome.action.setBadgeText({
                text: `PErr`,
                tabId: details.tabId
            });
            chrome.action.setBadgeBackgroundColor({
                    color: "#cc0000",
                    tabId: details.tabId
            })
        },50); 
    }
}

chrome.webRequest.onCompleted.addListener(async details => {
    if(details.type === "main_frame" && details.tabId !=-1) {
        const { autocheckRemoute } = await chrome.storage.local.get("autocheckRemoute");
        // console.log("autocheck2", autocheckRemoute, details.tabId);
        if (autocheckRemoute){
            // console.log("autocheck2 in", autocheckRemoute, details.tabId);
            if(!(200 <= details.statusCode && details.statusCode  < 300)){
                remouteCheck(details);
            } else{
                setTimeout(()=>{
                    chrome.action.setBadgeText({
                        text: `D${details.statusCode}`,
                        tabId: details.tabId
                    })
                    chrome.action.setBadgeBackgroundColor({
                        color: "green",
                        tabId: details.tabId
                    })
                }, 50);
            }
        } else{
            // console.log("autocheck2", "OFF", details.tabId);
            setTimeout(()=>{
                chrome.action.setBadgeText({
                    text: `OFF`,
                    tabId: details.tabId
                })
                chrome.action.setBadgeBackgroundColor({
                    color: "lightgrey", 
                    tabId: details.tabId
                })
            }, 50);
        }
    }
},
{urls:["<all_urls>"]}
)


chrome.webRequest.onErrorOccurred.addListener(async details => {
    // console.log(details);
    
    if(details.type === "main_frame" && details.tabId !=-1){
        const { autocheckRemoute } = await chrome.storage.local.get("autocheckRemoute");
        // console.log("autocheck3", autocheckRemoute);
        if (autocheckRemoute){
            remouteCheck(details)
        } else{
            // console.log("autocheck3", "OFF");
            setTimeout(()=>{
                chrome.action.setBadgeText({
                    text: `OFF`,
                    tabId: details.tabId
                })
                chrome.action.setBadgeBackgroundColor({
                    color: "lightgrey", 
                    tabId: details.tabId
                })
            }, 50);
        }
    }
},
{urls:["<all_urls>"]}
)

