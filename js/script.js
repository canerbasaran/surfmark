function getCurrentCat(callback) {
    chrome.storage.local.get("currentCat", callback)
};

function setCurrentCat(cat) {
    chrome.storage.local.set({ currentCat: cat }, () => {
        // console.log("Set Current Cat to " + cat)
        clearSelectCategory().then(() => {
            clearCardList().then(() => {
                show(cat)
            })
        })

    })
}

function deleteCard(idCard) {

    getCurrentCat((value) => {

        chrome.storage.sync.get(value.currentCat, (res) => {
            chrome.storage.local.get(value.currentCat, (reslocal) => {
                if (res[value.currentCat]) {
                    chrome.storage.sync.set({ [value.currentCat]: res[value.currentCat].filter(row => row.id != idCard) }, () => {
                        document.getElementById("card-" + idCard).remove();
                        updateProgressBar()
                        updateListProgressBar()
                    })
                } else {
                    chrome.storage.local.set({ [value.currentCat]: reslocal[value.currentCat].filter(row => row.id != idCard) }, () => {
                        document.getElementById("card-" + idCard).remove();
                    })
                }
            })
        })
    })
}

function deleteList() {
    var excludeArray = ["currentCat", "type", "isInit"]
    chrome.storage.sync.get(null, function (items) {
        chrome.storage.local.get(null, function (itemslocal) {
            var allKeys = Object.keys(itemslocal).concat(Object.keys(items)).filter(val => !excludeArray.includes(val));
            if (allKeys.length > 1) {
                getCurrentCat((value) => {
                    if (items[value.currentCat]) {
                        chrome.storage.sync.remove([value.currentCat], () => {
                            setCurrentCat(allKeys.filter(val => val != value.currentCat)[0])
                        })
                    } else {
                        chrome.storage.local.remove([value.currentCat], () => {
                            setCurrentCat(allKeys.filter(val => val != value.currentCat)[0])
                        })
                    }
                })
            } else {
                alert("Create a new List to delete this one. You must have at least one list.")
            }
        })
    })
}

function clearCardList() {
    return new Promise((resolve, reject) => {
        document.getElementById("card-list").innerHTML = ""
        resolve()
    })
};

function clearSelectCategory() {
    return new Promise((resolve, reject) => {
        document.getElementById("btn-group").innerHTML = ""
        resolve()
    })
};

function clearProgressBar() {
    return new Promise((resolve, reject) => {
        document.getElementById("progress-sync-quota").innerHTML = ""
        resolve()
    })
};

function clearListProgressBar() {
    return new Promise((resolve, reject) => {
        document.getElementById("progress-list-sync-quota").innerHTML = ""
        resolve()
    })
};

function show(cat) {
    chrome.storage.sync.get(cat, function (ressync) {
        chrome.storage.local.get(cat, function (reslocal) {

            // rajouter var bool sync ?
            if (ressync[cat]) {
                var res = ressync[cat]
                var isSync = true
            } else {
                var res = reslocal[cat]
                var isSync = false
            }

            getCategories()

            if (isSync) {
                document.getElementById('sync-off').style.display = "block"
                document.getElementById('sync-on').style.display = "none"
                document.getElementById('progress-list-sync-quota').style.display = "flex"
                updateListProgressBar()
            } else {
                document.getElementById('sync-on').style.display = "block"
                document.getElementById('sync-off').style.display = "none"
                document.getElementById('progress-list-sync-quota').style.display = "none"
            }

            updateProgressBar()

            res.forEach(row => {
                var card = document.createElement("div")
                card.className = "card mb-2 border-light"
                card.setAttribute("id", "card-" + row.id)

                var cardBody = document.createElement("div")
                cardBody.className = "card-body p-2"

                var cardTitle = document.createElement("div")
                cardTitle.className = "card-title mb-1 clearfix"

                var cardTitleURL = document.createElement("div")
                cardTitleURL.className = "float-left"

                var cardTitleLink = document.createElement("a")
                var preparedSelection = (row.selected.length > 125) ? row.selected.substring(0, row.selected.lastIndexOf(" ")) : row.selected
                cardTitleLink.setAttribute('href', row.url + "#:~:text=" + encodeURIComponent(preparedSelection));

                cardTitleLink.setAttribute('target', "_blank");
                cardTitleLink.className = "cardLink text-info"
                cardTitleLink.innerHTML = row.url.substring(0, 29).replace(/^https?\:\/\//i, "") + "...";

                var cardTitleTime = document.createElement("div")
                cardTitleTime.className = "float-right text-muted"
                cardTitleTime.innerHTML = row.datetime;

                var deleteDiv = document.createElement("div")
                var deleteButton = document.createElement("img")
                deleteDiv.className = "delete"
                deleteDiv.setAttribute("id", row.id)
                deleteButton.setAttribute('src', 'images/minus-circle-solid.svg')
                deleteButton.setAttribute('width', '15')
                deleteButton.setAttribute('alt', 'minus-circle')
                deleteDiv.appendChild(deleteButton)


                var cardText = document.createElement("div")
                cardText.className = "card-text"
                var threeDots = (row.selected.length > 125) ? "..." : "";
                cardText.innerHTML = row.selected.substring(0, 125).trim() + threeDots

                var cardList = document.querySelector("#card-list")

                card.appendChild(cardBody)
                cardBody.appendChild(cardTitle)
                cardTitle.appendChild(cardTitleURL)
                cardTitleURL.appendChild(cardTitleLink)
                cardTitle.appendChild(cardTitleTime)
                cardTitle.appendChild(deleteDiv)
                cardBody.appendChild(cardText)
                cardList.prepend(card)


                var deleteButtons = document.getElementsByClassName('delete');
                for (var i = 0; i < deleteButtons.length; i++) {
                    deleteButtons[i].onclick = function () {
                        deleteCard(this.id);
                    }
                };

                // var cardLinks = document.getElementsByClassName('cardLink');
                // for (var i=0; i < cardLinks.length; i++) {
                //     cardLinks[i].onclick = function(){
                //         openAndHighlight(this.dataset.url, this.dataset.text);
                //     }
                // };
            })
        })
    });
}

function getCategories() {
    var excludeArray = ["currentCat", "type", "isInit"]
    chrome.storage.sync.get(null, function (items) {
        chrome.storage.local.get(null, function (itemslocal) {
            var allKeys = Object.keys(itemslocal).concat(Object.keys(items)).filter(val => !excludeArray.includes(val));
            // var allKeys = Object.keys(items).filter(val => val != "currentCat" && val != "email");

            getCurrentCat((value) => {
                var btnGroup = document.querySelector("#btn-group")
                var btn = document.createElement("button")
                btn.className = "btn bg-white btn-block dropdown-toggle font-weight-bold d-flex justify-content-between align-items-center"
                btn.setAttribute("type", "button")
                btn.setAttribute("id", "dropdownMenuButton1")
                btn.setAttribute("data-bs-toggle", "dropdown")
                btn.setAttribute("aria-expanded", "false")
                var btnText = document.createElement("span")
                btnText.innerHTML = value.currentCat
                if (Object.keys(items).includes(value.currentCat)) {
                    btnText.innerHTML = "<span class='text-primary'><i class='fas fa-cloud mr-2'></i></span>" + value.currentCat
                } else {
                    btnText.innerHTML = value.currentCat
                }
                var btnArrow = document.createElement("i")
                btnArrow.className = "fas fa-caret-down text-muted"

                var dropdownMenu = document.createElement("ul")
                dropdownMenu.className = "dropdown-menu col-lg-12"
                dropdownMenu.setAttribute("aria-labelledby", "dropdownMenuButton1")

                var dropdownItemLiAddCat = document.createElement("li")
                var dropdownItemAddCat = document.createElement("a")
                var dropdownItemDivider = document.createElement("div")
                dropdownItemAddCat.className = "dropdown-item"
                dropdownItemAddCat.setAttribute("href", "#")
                dropdownItemAddCat.setAttribute("id", "addCat")
                dropdownItemAddCat.innerHTML = "<i class='fas fa-plus-circle'></i>&nbsp Add a New List"
                dropdownItemLiAddCat.appendChild(dropdownItemAddCat)
                dropdownItemDivider.className = "dropdown-divider"
                dropdownItemAddCat.setAttribute("data-bs-toggle", "modal")
                dropdownItemAddCat.setAttribute("data-bs-target", "#myModal")

                dropdownMenu.appendChild(dropdownItemLiAddCat)
                dropdownItemLiAddCat.appendChild(dropdownItemAddCat)
                dropdownItemLiAddCat.appendChild(dropdownItemDivider)

                allKeys.sort(function (a, b) { return a.localeCompare(b, 'en', { 'sensitivity': 'base' }) }).forEach(key => {
                    var dropdownItemLi = document.createElement("li")
                    var dropdownItem = document.createElement("a")
                    if (Object.keys(items).includes(key)) {
                        dropdownItem.className = "dropdown-item syncList"
                        dropdownItem.innerHTML = key + "<span class='text-primary float-right'><i class='fas fa-cloud ml-2'></i></span>"
                    } else {
                        dropdownItem.className = "dropdown-item"
                        dropdownItem.innerHTML = key
                    }
                    dropdownItem.setAttribute("href", "#")


                    dropdownMenu.appendChild(dropdownItemLi)
                    dropdownItemLi.appendChild(dropdownItem)


                })

                btnGroup.appendChild(btn)
                btnGroup.appendChild(dropdownMenu)
                btn.appendChild(btnText)
                btn.appendChild(btnArrow)

                var categories = document.querySelector("#categories")
                categories.appendChild(btnGroup)

                var categoriesBtns = document.querySelectorAll('.dropdown-item:not(#addCat):not(#confirm-delete-btn):not(#download-as-csv):not(#sync-on):not(#sync-off):not(#import-list)');
                for (var i = 0; i < categoriesBtns.length; i++) {
                    categoriesBtns[i].onclick = function () {
                        setCurrentCat(this.innerText);
                    }
                };

            });
        });
    });
};

function createList() {
    chrome.storage.local.get(null, function (localres) {
        chrome.storage.sync.get(null, function (items) {
            var excludeArray = ["currentCat", "type", "isInit"]
            var allKeys = Object.keys(localres).concat(Object.keys(items)).filter(val => !excludeArray.includes(val));
            var listName = document.getElementById("list-name").value.trim() //+ "/%s"
            if (listName != "" && allKeys.filter(val => val === listName).length === 0) {
                chrome.storage.local.set({ [listName.trim()]: [] }, () => {
                    document.getElementById("close-modal").click()
                    document.getElementById("list-name").value = ""
                    clearSelectCategory().then(() => {
                        clearCardList().then(() => {
                            setCurrentCat(listName.trim());
                            // console.log('New list: ' + listName)
                        })
                    })
                })
            } else if (allKeys.filter(val => val === listName).length > 0) {
                alert("This List name already exist.")
            }
        })
    })


};

function string_to_slug(str) {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();

    // remove accents, swap ñ for n, etc
    var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
    var to = "aaaaeeeeiiiioooouuuunc------";
    for (var i = 0, l = from.length; i < l; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }
    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes

    return str;
}

function convertToCSV(arr) {
    const array = [Object.keys(arr[0])].concat(arr)

    return array.map(it => {
        return Object.values(it).toString()
    }).join('\n')
}



function saveAsCSV() {
    chrome.storage.local.get(null, function (localres) {
        getCurrentCat((value) => {
            chrome.storage.sync.get(value.currentCat, function (ressync) {

                if (ressync[value.currentCat]) {
                    var res = ressync[value.currentCat]
                } else {
                    var res = localres[value.currentCat]
                }

                if (res.length > 0) {
                    var csvString = [
                        [
                            "datetime",
                            "selected",
                            "url"
                        ],
                        ...res.map(item => [
                            item.datetime,
                            (item.selected.length > 125) ? '"' + item.selected.trim().replace(/"/g, '""') + '..."' : '"' + item.selected.trim().replace(/"/g, '""') + '"',
                            // (item.selected.length>125) ? item.selected.trim() : item.selected.trim(),
                            item.url
                        ])
                    ]
                        .map(e => e.join(","))
                        .join("\n");

                    var hiddenElement = document.createElement('a');
                    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvString);
                    hiddenElement.target = '_blank';
                    hiddenElement.download = string_to_slug(value.currentCat) + '.csv';
                    hiddenElement.click();
                } else {
                    alert("Your list is empty!")
                }

            })
        })
    })
}

function turnSyncOn() {
    getCurrentCat((value) => {
        chrome.storage.local.get([value.currentCat], function (reslocal) {
            var localListSize = new TextEncoder().encode(JSON.stringify(reslocal[value.currentCat])).length
            var localListNameSize = new TextEncoder().encode(value.currentCat).length
            if (localListSize + localListNameSize >= 8150) {
                alert('This List is too large to be synced \n\nPlease remove some highlights to be able to turn on Sync! (Roughly ' + Math.ceil((localListSize - 8192) / 362) + ' highlights)')
            } else {
                getSyncQuota(false).then((currentQuota) => {
                    // console.log(currentQuota)
                    // console.log(localListSize)
                    if ((currentQuota + localListSize + localListNameSize) >= 102350) {
                        alert('You have reached the Sync Storage size limit! \n\nPlease turn off Sync for other Lists to Sync this List (Settings > Turn sync off) OR delete some Synced List!')
                    } else {
                        var list = reslocal[value.currentCat]
                        chrome.storage.sync.set({ [value.currentCat]: list }, () => {
                            chrome.storage.local.remove([value.currentCat])
                            clearSelectCategory().then(() => {
                                clearCardList().then(() => {
                                    show(value.currentCat)
                                })
                            })
                        })
                    }
                })
            }
        })
    });
}

function turnSyncOff() {
    getCurrentCat((value) => {
        chrome.storage.sync.get([value.currentCat], function (ressync) {
            var list = ressync[value.currentCat]
            chrome.storage.local.set({ [value.currentCat]: list }, () => {
                chrome.storage.sync.remove([value.currentCat])
                clearSelectCategory().then(() => {
                    clearCardList().then(() => {
                        show(value.currentCat)
                    })
                })
            })
        })
    });
}
function getSyncQuota(returnPercentage = true) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.getBytesInUse(null, (size) => {
            var percentage = Math.round((size / 102400) * 1000) / 10
            if (returnPercentage) {
                resolve(percentage)
            } else {
                resolve(size)
            }
        })

    })
}

function getListSyncQuota(returnPercentage = true) {
    return new Promise((resolve, reject) => {
        getCurrentCat((value) => {
            chrome.storage.sync.getBytesInUse(value.currentCat, (size) => {
                var percentage = Math.round((size / 8192) * 1000) / 10
                if (returnPercentage) {
                    resolve(percentage)
                } else {
                    resolve(size)
                }
            })
        })

    })
}

function updateProgressBar() {
    clearProgressBar().then(() => {
        getSyncQuota().then((currentQuota) => {
            var progressSyncQuota = document.getElementById('progress-sync-quota')
            var progressBar = document.createElement("div")
            progressBar.className = "progress-bar"
            progressBar.setAttribute('role', 'progressbar')
            progressBar.setAttribute('aria-valuenow', currentQuota)
            progressBar.setAttribute('aria-valuemax', '100')
            progressBar.style.width = currentQuota + '%'

            var progressBarLabel = document.createElement("span")
            progressBarLabel.className = "justify-content-center align-middle d-flex position-absolute w-100 font-weight-bold"
            progressBarLabel.innerHTML = "Total Sync storage: " + currentQuota + "%"

            progressSyncQuota.appendChild(progressBar)
            progressSyncQuota.appendChild(progressBarLabel)
        })
    })
}

function updateListProgressBar() {
    clearListProgressBar().then(() => {
        getListSyncQuota().then((currentQuota) => {
            var progressListSyncQuota = document.getElementById('progress-list-sync-quota')
            var progressBar = document.createElement("div")
            progressBar.className = "progress-bar"
            progressBar.setAttribute('role', 'progressbar')
            progressBar.setAttribute('aria-valuenow', currentQuota)
            progressBar.setAttribute('aria-valuemax', '100')
            progressBar.style.width = currentQuota + '%'

            var progressBarLabel = document.createElement("span")
            progressBarLabel.className = "justify-content-center align-middle d-flex position-absolute w-100 font-weight-bold"
            progressBarLabel.innerHTML = "Sync storage for this list: " + currentQuota + "%"

            progressListSyncQuota.appendChild(progressBar)
            progressListSyncQuota.appendChild(progressBarLabel)
        })
    })
}


function createImportedList(listName, importedData) {
    chrome.storage.local.get(null, function (localres) {
        chrome.storage.sync.get(null, function (items) {
            var excludeArray = ["currentCat", "type", "isInit"]
            var allKeys = Object.keys(localres).concat(Object.keys(items)).filter(val => !excludeArray.includes(val));

            if (listName != "" && allKeys.filter(val => val === listName).length === 0) {
                chrome.storage.local.set({ [listName.trim()]: importedData }, () => {
                    clearSelectCategory().then(() => {
                        clearCardList().then(() => {
                            setCurrentCat(listName.trim());
                            // console.log('New list: ' + listName)
                        })
                    })
                })
            } else if (allKeys.filter(val => val === listName).length > 0) {
                alert("This List name already exist. Rename the file or delete the list.")
                window.close();
            }
        })
    })
}

// function csvToArray(str) {
//     arr = Papa.parse(str,{header: true})['data']
//     return arr;
// }


document.addEventListener('DOMContentLoaded', function () {
    var createListBtn = document.getElementById("create-list-btn");
    // onClick's logic below:
    createListBtn.addEventListener('click', function () {
        createList()
    });

    var inputListName = document.getElementById("list-name");
    inputListName.addEventListener('keyup', function (event) {
        if (event.key === 'Enter') {
            createList()
        }
    });

    var downloadCsvBtn = document.getElementById("download-as-csv");
    downloadCsvBtn.addEventListener('click', function () {
        saveAsCSV()
    })

    var importList = document.getElementById("import-list");
    var fileInput = document.getElementById("file-input")
    importList.addEventListener('click', function () {
        //ici
        chrome.storage.local.get(null, function (localres) {
            fileInput.click()
            fileInput.onchange = () => {
                const selectedFile = fileInput.files[0];

                const reader = new FileReader();


                reader.onload = function (e) {
                    // reader.result.replace(/(\"\")/g,'"').slice(1,-1);
                    const text = e.target.result;
                    console.log(text)
                    const data = Papa.parse(text, { header: true })['data'];

                    data.forEach(function (value, i) {
                        value.id = i + "." + Math.random()
                        // value.selected = value.selected.replaceall
                        // reader.result.replace(/(\"\")/g,'"').slice(1,-1);
                    });

                    listName = selectedFile.name.replace(".csv", "").replaceAll("-", " ")
                    listName = listName.charAt(0).toUpperCase() + listName.slice(1)
                    listName = listName.substring(0, 26);

                    // console.log(listName)
                    // console.log(data);

                    createImportedList(listName, data)
                    // document.write(JSON.stringify(data));
                };

                reader.readAsText(selectedFile);

            }
        })
    })

    var deleteListBtn = document.getElementById("confirm-delete-btn");
    deleteListBtn.addEventListener('click', function () {
        deleteList()
    })

    var syncOnBtn = document.getElementById("sync-on");
    syncOnBtn.addEventListener('click', function () {
        turnSyncOn()
    })

    var syncOffBtn = document.getElementById("sync-off");
    syncOffBtn.addEventListener('click', function () {
        turnSyncOff()
    })

    // var syncOffBtn= document.getElementById("import-list");
    // syncOffBtn.addEventListener('click', function() {
    //     importList()
    // })

});


getCurrentCat((value) => {
    show(value.currentCat)
});
