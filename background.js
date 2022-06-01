// background.js chrome

function getCurrentCat(callback) {
    chrome.storage.local.get("currentCat", callback)
};

//Initialisation
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(null, function (localres) {
        if (!localres.isInit) {
            //Initialiser 'data' chrome.storage.local
            chrome.storage.sync.get("My First List", function (ressync) {
                chrome.storage.local.get("My First List", function (reslocal) {
                    if (!(ressync['My First List'] || reslocal['My First List'])) {
                        chrome.storage.local.set({ "My First List": [{ datetime: '2021-07-14 14:00', id: 123123123.123, selected: "To add a highlight, select text from any web page, right-click on it and click on 'Add to Surfmark'", url: "https://https://github.com/canerbasaran/surfmark" }] }, () => {
                            // console.log('Init chrome.storage')
                            chrome.storage.local.set({ currentCat: "My First List" }, () => { })
                        });
                    } else {
                        chrome.storage.local.set({ currentCat: "My First List" }, () => { })
                    }
                })
            })

            //Set initial token
            chrome.storage.local.set({ isInit: true })
        }
        //Créer menu contextuel (sélection)
        chrome.contextMenus.create({
            id: "surfmark",
            title: "Add to Surfmark",
            contexts: ['selection']
        });

    })

});

//Lors du click sur le menu contextuel
chrome.contextMenus.onClicked.addListener((info, tab) => {

    getCurrentCat((value) => {

        var currentDate = new Date();
        var datetime = currentDate.getFullYear() + "-" + ("0" + (currentDate.getMonth() + 1)).slice(-2) + "-" + ("0" + currentDate.getDate()).slice(-2) + " " +
            + ("0" + currentDate.getHours()).slice(-2) + ":" + ("0" + currentDate.getMinutes()).slice(-2);

        if (info.selectionText.trim() != '') {
            chrome.storage.sync.get(value.currentCat, function (ressync) {
                chrome.storage.local.get(value.currentCat, function (reslocal) {

                    var addData = {
                        id: Date.now() + Math.random(),
                        datetime: datetime,
                        selected: info.selectionText.substring(0, 126),
                        url: info.pageUrl
                    }

                    if (ressync[value.currentCat]) {
                        chrome.storage.sync.getBytesInUse(value.currentCat, (size) => {

                            var sizeNewData = new TextEncoder().encode(JSON.stringify(addData)).length
                            chrome.storage.sync.getBytesInUse(null, (currentQuota) => {

                                if ((currentQuota + sizeNewData) >= 102400) {
                                    alert('You have reached the Sync Storage size limit! \n\nPlease turn off Sync for other Lists to Sync this List (Settings > Turn sync off) OR delete some Synced List!')
                                } else {
                                    var data = ressync[value.currentCat]
                                    data.push(addData)
                                    chrome.storage.sync.set({ [value.currentCat]: data }, () => {
                                        chrome.notifications.create('', {
                                            title: 'Surfmark',
                                            message: 'Your selection has been saved!',
                                            iconUrl: 'images/ico.png',
                                            type: 'basic',
                                            priority: 2
                                        });
                                    });
                                }
                            })
                        })
                    } else {
                        var data = reslocal[value.currentCat]
                        // console.log(reslocal[value.currentCat])
                        data.push(addData)
                        chrome.storage.local.set({ [value.currentCat]: data }, () => {
                            chrome.notifications.create('', {
                                title: 'Surfmark',
                                message: 'Your selection has been saved!',
                                iconUrl: 'images/ico.png',
                                type: 'basic',
                                priority: 2
                            });
                        });
                    }

                });
            });
        }
    })
});

