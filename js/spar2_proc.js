/* ____________________ states ____________________ */

var projects;
var y;
var suggested = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
var chosen = {};
var chains = { "1": "ethereum", "8453": "base" }
var explorers = { "1": "https://etherscan.io/address/", "8453": "https://basescan.org/address/" };
var curclick = '';
var semantic = false;
const btns = { 'ts': 'DT', 'n_txs': 'TX', 'uniq_owners': 'UO', 'g1': 'G1', 'g2': 'G2', 'g3': 'G3', 'connection': 'CX', 'lucky': 'feel lucky?' };
var temperature = 0.005;
var excluded = {};
var faved = {};
var lastres = {};
var lastreco = {};
var search_curl = 0;
var search_curr = 10;
var sugg_curl = 0;
var sugg_curr = 10;
var top10Results; // tracking search results

/* ____________________ data ____________________ */

function toggleStorage() {
    if (document.getElementById('storage_switch').checked) {
        localStorage.setItem('faved', JSON.stringify(faved));
    } else {
        localStorage.removeItem('faved');
    }
}

models = [{ 'projs': 'mainnet-projs-v.0.2.json', 'model': 'mainnet-model-v.0.2.json' },
{ 'projs': 'jpg-projs.json', 'model': 'jpg-model.json' },
{ 'projs': 'base-projs-v.0.1.json', 'model': 'base-model-v.0.1.json' },
{ 'projs': 'mixed-projs-v.0.1.json', 'model': 'mixed-model-v.0.1.json' }]

// on window load when it's done
window.onload = function () {
    reloadMaterials();    
}

async function reloadMaterials() {
    search_curl = 0;
    search_curr = 10;
    sugg_curl = 0;
    sugg_curr = 10;
    await fetch("json/" + models[document.getElementById('model_choice').value].projs)
        .then(response => response.json())
        .then(data => {
            projects = data;
        });
    await fetch("json/" + models[document.getElementById('model_choice').value].model)
        .then(response => response.json())
        .then(data => {
            y = data;
        });
    resetChosen();
    await excludeBigs();
    udRes('ts', true);
}

/* ____________________ functions ____________________ */

// populate exclusion array when clicking red circle
function exclude(a) {
    excluded[a] = true;
}

// populate chosen array when click plus, update suggestions
function updateSugg(a = '', redo = false) {
    if (a in chosen && a != '') {
        chosen[a] = !chosen[a];
    } else if (a != '') {
        chosen[a] = true;
    }
    const tot = totalChosen();
    updateSelectedModal();
    document.getElementById('count_badge').innerText = tot;
    document.getElementById('count_badge_2').innerText = tot;
    if (tot > 0) {
        document.getElementById('sugg_content').innerHTML = '';
        var rs = r();
        var j = 0;
        if (redo) {
            rs = [...lastreco];
            temp = [...lastreco];
        } else {
            temp = [...suggested];
        }
        for (let i = sugg_curl; i < projects.length; i++) {
            if (!(projects[rs[i]].address in chosen) && !(projects[rs[i]].address in excluded)) {
                divItem = makeItem(projects[rs[i]], true, true);
                if (rs[i] != temp[j] && temp.indexOf(rs[i]) < 0 && i % 2 == 0) {
                    divItem.classList.add('animate__animated')
                    divItem.classList.add('animate__slideInRight')
                } else if (rs[i] != temp[j] && temp.indexOf(rs[i]) < 0 && i % 2 != 0) {
                    divItem.classList.add('animate__animated')
                    divItem.classList.add('animate__slideInLeft')
                } else if (temp.indexOf(rs[i]) >= 0 && temp.indexOf(rs[i]) > j) {
                    divItem.classList.add('animate__animated')
                    divItem.classList.add('animate__slideInUp')
                } else if (temp.indexOf(rs[i]) >= 0 && temp.indexOf(rs[i]) < j) {
                    divItem.classList.add('animate__animated')
                    divItem.classList.add('animate__slideInDown')
                }
                suggested[j] = rs[i];
                document.getElementById('sugg_content').append(divItem);
                j++;
                if (j > 9) {                    
                    document.getElementById('sugg_content').innerHTML += `<div></div><div style=width:100%;text-align:right;><span class="adv" onclick="sugg_ladv();">&#11013;</span> ${sugg_curl + 1} &dash; ${sugg_curr} <span class="adv" onclick="sugg_radv()">&#10145;</span></div>`;
                    break;
                }  
            }
        }
        lastreco = [...suggested];
        document.getElementById('view_suggestions_btn').style.visibility = 'visible';
    } else {
        document.getElementById('view_suggestions_btn').style.visibility = 'hidden';
        document.getElementById('sugg_content').innerHTML = '<em><br />&uarr; select some projects...</em><br /><br />';
    }
}

// temperature implementation
const pulse = (v, s) => v.map(val => val + (Math.random() * 2 - 1) * s);

// compute recommendations
function r() {
    vs = math.multiply(math.multiply(x(), y), math.transpose(y));
    vs = pulse(vs, temperature);
    return [...vs._data.keys()].sort((a, b) => vs._data[b] - vs._data[a]);
}

// selected projects as vector input to recommendations (`X`)
function x() {
    var x = math.zeros(projects.length);
    Object.entries(chosen).forEach(([a, v]) => {
        if (v && !(a in excluded)) {
            x.set([projects.findIndex(entry => entry['address'] === a)], 1);
        }
    });
    return x;
}

// compute # selected for suggestions
function totalChosen() {
    tot = 0;
    Object.entries(chosen).forEach(([a, v]) => {
        if (v && !(a in excluded)) tot++;
    });
    return tot;
}

// what it's called
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// update search results for selecting inputs
var desc = true;
function udRes(func, redo = false) {
    const searchTerm = document.getElementById('search_txt').value.toLowerCase();
    const resultDiv = document.getElementById('result_div');
    if (func == curclick & redo) {
        desc = !desc;
        search_curl = 0;
        search_curr = 10;
    } else if (func == curclick & !redo) {
        // radv or ladv  
    }
    else {
        desc = true;
        search_curl = 0;
        search_curr = 10;
    }

    const elementsWithUDClass = document.querySelectorAll('.ud');
    elementsWithUDClass.forEach(element => {
        element.classList.remove('is-active');
    });
    resultDiv.innerHTML = '';

    var temp = [...projects];

    if (curclick != '' || func != '') {
        if (curclick != '' && curclick != 'search') document.getElementById(curclick + '_btn').innerHTML = btns[curclick];

        if (func != 'search' && func != 'lucky') {
            document.getElementById(func + '_btn').classList.add('is-active');
            if (desc) {
                temp = temp.filter(item => !(item.address in excluded)).sort((a, b) => b[func] - a[func]);
                arrow = '&darr;'
            } else {
                temp = temp.filter(item => !(item.address in excluded)).sort((a, b) => a[func] - b[func]);
                arrow = '&uarr;'
            }
            document.getElementById(func + '_btn').innerHTML = btns[func] + arrow;
            top10Results = temp.slice(search_curl, search_curr);
        } else if (func == 'lucky') {
            document.getElementById(func + '_btn').classList.add('is-active');
            if (redo) {
                top10Results = lastres;
            } else {
                const randomIndices = [];
                while (randomIndices.length < 20) {
                    const randomIndex = getRandomInt(0, projects.length - 1);
                    if (!randomIndices.includes(randomIndex)) {
                        randomIndices.push(randomIndex);
                    }
                }
                top10Results = randomIndices
                    .filter(index => !(projects[index].address in excluded))
                    .sort((a, b) => projects[a][func] - projects[b][func])
                    .slice(search_curl, search_curr)
                    .map(index => projects[index])
                    .slice(0, 10);
                lastres = top10Results;
            }
        } else {
            if (searchTerm == '') return;
            const filteredProjects = temp.filter(project =>
                project.name.toLowerCase().includes(searchTerm)
            );
            top10Results = filteredProjects
                .filter(project => !(project.address in excluded))
                .slice(search_curl, search_curr);
        }

        top10Results.forEach(project => {
            const divItem = makeItem(project, true, true);
            resultDiv.appendChild(divItem);
        });
        if (top10Results.length == 10 & func != 'lucky') {
            resultDiv.innerHTML += `<div></div><div style=width:100%;text-align:right;><span class="adv" onclick="search_ladv();">&#11013;</span> ${search_curl + 1} &dash; ${search_curr} <span class="adv" onclick="search_radv()">&#10145;</span></div>`;
        }
        curclick = func;
    }
}

// advance left or right in search
function search_ladv() {
    if (search_curl >= 10) {
        search_curl -= 10;
        search_curr -= 10;
        udRes(curclick, false);
    }
}
function search_radv() {
    if (top10Results.length == 10) {
        search_curl += 10;
        search_curr += 10;
        udRes(curclick, false);
    }
}
function sugg_ladv() {
    if (sugg_curl >= 10) {
        sugg_curl -= 10;
        sugg_curr -= 10;        
        updateSugg('', false);
    }
}
function sugg_radv() {
    if (sugg_curl < sugg_curr) {
        sugg_curl += 10;
        sugg_curr += 10;        
        updateSugg('', false);
    }
}

// process OS data's image entry
function getImage(project) {
    if (project.img != '') {
        return project.img;
    } else {
        if (project.name == 'Art Blocks') {
            return "images/ab.png";
        } else {
            for (let i = 0; i < projects.length; i++) {
                if (project.name == projects[i].name && project.address != projects[i].address) {
                    return projects[i].img;
                }
            }
            return "images/q.png";
        }
    }
}

// make a fave
function makeFave(h) {
    if (h.classList.contains("heart-off")) {
        h.classList.remove("heart-off");
        h.classList.add("heart-on");
        faved[h.attributes.data.value] = true;
    } else {
        h.classList.remove("heart-on");
        h.classList.add("heart-off");
        faved[h.attributes.data.value] = false;
    }
    updateFaved();
    updateSugg('', true);
    udRes(curclick, false);
}

// mark project as favorite or not with filled/open heart
function checkFave(project) {
    heart_state = "heart-off";
    if (project.address in faved) {
        if (faved[project.address]) {
            heart_state = "heart-on";
        }
    }
    return `<span class="heart ${heart_state}" onclick="makeFave(this);" data="${project.address}">&#9829;</span>`;
}

// populate div's with project details + buttons
function makeItem(project, plus = true, minus = true) {
    const divItem = document.createElement('div');
    const imgItem = document.createElement('img');
    imgItem.src = getImage(project);
    imgItem.classList.add("proj-logo");
    imgItem.dataset.value = project.address;

    divItem.style.backgroundColor = "#112233";
    if (project.address in chosen) {
        if (chosen[project.address] == true) {
            divItem.style.backgroundColor = "#112255";
        }
    }
    divItem.classList.add("row-container");
    divItem.classList.add("cell");
    divItem.classList.add("m-0");
    if (!(project.address in chosen) && plus) {
        divItem.innerHTML += `<img src="images/plus.jpg" class="add-btn" data="${project.address}" />`;
    }
    if (minus) {
        divItem.innerHTML += `<img src="images/x.png" class="x-btn" data="${project.address}" />`;
    }
    divItem.innerHTML += checkFave(project);
    divItem.appendChild(imgItem);

    divItem.innerHTML += `<img class="chain-logo" src="images/${chains[project.chainid]}_logo.png" />`;
    //projDt = `<small style="font-size: 0.5em; opacity: 0.5;">${project.dt}</small>`;
    const dateParts = project.dt.split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1;
    const day = parseInt(dateParts[2]);

    let projDt = new Date(year, month, day).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    projDt = '<small style="font-size: 0.5em; opacity: 0.5;">' + projDt + '</small>';
    divItem.innerHTML += `<div class="metadata">${project.name.substring(0, 30) + (project.name.length > 30 ? '...' : '')} ${projDt}</small><br /><span class="content is-small" />${contractLink(project)}</div>`;
    return divItem;
}

// modal displays + stats + settings functions
function closeModal() {
    document.getElementById('modal_project').classList.remove('is-active');
    document.getElementById('modal_options').classList.remove('is-active');
    document.getElementById('modal_selected').classList.remove('is-active');
    document.getElementById('modal_faved').classList.remove('is-active');
    document.getElementById('modal_help').classList.remove('is-active');
    if (curclick != '') udRes(curclick, false);
}
function showSelectedModal() {
    document.getElementById('modal_selected').classList.add('is-active');
}
function showProjectModal(img) {
    for (let i = 0; i < projects.length; i++) {
        if (img.dataset.value == projects[i].address) {
            document.getElementById('modal_title').innerText = projects[i].name;
            document.getElementById('modal_content_focus').innerHTML = statsDiv(projects[i]);
            document.getElementById('modal_project').classList.add('is-active');
            return;
        }
    }
}

function statsTag(v, n) {
    return `<span class="tag is-black">${v} ${n}</span>`;
}

function statsDiv(project) {
    s = `<img src="${getImage(project)}" style="width:100px;height:100px;border-radius:100000px;vertical-align:middle;" />`
    s += '&nbsp;' + contractLink(project) + '<br />';
    s += `<span class="content is-primary">${markdownToHTML(project.desc)}<span>`;
    s += `<br /><br /><b>Created</b> ${project.dt}`;
    s += `<br /><br /><b>Stats in snapshot</b><br /> ${showSpecial(project)}${statsTag(project.uniq_owners, "unique owners")}`;
    s += ` ${statsTag(project.n_txs, "transactions")}`;
    s += ` ${statsTag(project.connection, "connection score")}`;
    return `${s}`;
}
function showSpecial(project) {
    if (document.getElementById('model_choice').value == '1') { // JPG
        return `<img src="images/jpg.jpg" style="vertical-align:middle;width:50px;height:50px;border-radius:10000px;" /> featured in ${project.n_gals} galler${project.n_gals == 1 ? 'y' : 'ies'}<br />`;
    } else {
        return '';
    }
}

function contractLink(project) {
    const expl_link = explorers[project.chainid] + project.address;
    const expl_img = `<img src="images/${chains[project.chainid]}_expl.png" class="link-logo" />`;
    const expl_a = `${project.address.substring(0, 10)} <a href="${expl_link}" target="_blank">${expl_img}</a>`;

    const os_link = `https://opensea.io/collection/${project.slug}`;
    const os_img = `<img src="images/os.png" class="link-logo" />`;
    const os_a = ` <a href="${os_link}" target="_blank">${os_img}</a>`;

    const occ_link = `https://onchainchecker.xyz/collection/${chains[project.chainid]}/${project.address}/1`;
    const occ_img = `<img src="images/occ.png" class="link-logo" />`;
    const occ_a = ` <a href="${occ_link}" target="_blank">${occ_img}</a>`;

    return expl_a + os_a + occ_a;
}

async function resetChosen() {
    chosen = {};
    excluded = {};
    await excludeBigs();
    suggested = [];
    sugg_curl = 0;
    sugg_curr = 10;
    // document.getElementById('exclude_bigs_switch').checked = null;
    document.getElementById('result_div').innerHTML = '';
    if (curclick != '') {
        // desc = !desc;
        udRes(curclick);
    }
    document.getElementById('count_badge').innerText = 0;
    document.getElementById('count_badge_2').innerText = 0;
    document.getElementById('view_suggestions_btn').style.visibility = 'hidden';
    document.getElementById('sugg_content').innerHTML = '<em><br />&uarr; select some projects...</em><br /><br />';
}

function markdownToHTML(text) {
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\[(.+?)\]\((.+?)\)/g, '<a target="_blank" href="$2">$1</a>');
    return text;
}

function showOptions() {
    document.getElementById('modal_options').classList.add('is-active');
}

function showHelp() {
    document.getElementById('modal_help').classList.add('is-active');
}

function updateFaved() {
    if (Object.keys(faved).length > 0) {
        document.getElementById("modal_content_faved").innerHTML = "";
    }
    Object.entries(faved).forEach(([a, v]) => {
        if (v && !(a in excluded)) {
            project = projects[projects.findIndex(entry => entry['address'] === a)];
            if (!(typeof project === 'undefined')) {
                favedItem = makeItem(project, true, false);
                document.getElementById("modal_content_faved").appendChild(favedItem);
            }
        }
    });
    if (document.getElementById('storage_switch').checked) localStorage.setItem('faved', JSON.stringify(faved));
}
function showFaved() {
    updateFaved();
    document.getElementById('modal_faved').classList.add('is-active');
}

function updateSelectedModal() {
    document.getElementById("modal_content_selected").innerHTML = "";
    Object.entries(chosen).forEach(([a, v]) => {
        if (v && !(a in excluded)) {
            selectedItem = makeItem(projects[projects.findIndex(entry => entry['address'] === a)], false, true);
            document.getElementById("modal_content_selected").appendChild(selectedItem);
        }
    });
}

function setOption(e, v) {
    if (e == 'temperature') {
        temperature = v;
        updateSugg('', false);
    } else {
        updateSugg('', true);
    }
}

async function excludeBigs() {
    var refprojs;
    await fetch('json/' + models[0].projs)
        .then(response => response.json())
        .then(data => {
            refprojs = data;
        });
    if (document.getElementById('exclude_bigs_switch').checked) {
        for (let i = 0; i < refprojs.length; i++) {
            if (refprojs[i].n_txs > 200) excluded[refprojs[i].address] = true;
        }
    } else {
        for (let i = 0; i < refprojs.length; i++) {
            if (refprojs[i].n_txs > 200) {
                excluded = removeEntry(excluded, refprojs[i].address);
            }
        }
    }
    udRes(curclick, false);
    updateSugg('', false);
}

function removeEntry(obj, keyToRemove) {
    const newObj = {};
    for (const key in obj) {
        if (key !== keyToRemove) {
            newObj[key] = obj[key];
        }
    }
    return newObj;
}

async function preloadWallet() {
    let address = document.getElementById('address_preload_txt').value;
    if (address.length > 0) {
        document.getElementById('preload_status').innerText = 'loading...';
        const options = { method: 'GET', headers: { accept: 'application/json' } };
        var temp = [...projects];
        temp = temp.filter(item => !(item.address in excluded)).sort((a, b) => b['connection'] - a['connection']);

        if (document.getElementById('model_choice').value in [0, 1]) {
            chain = 'eth';
        } else if (document.getElementById('model_choice').value == 2) {
            chain = 'base';
            if (address.substring(0, 2) != '0x') {
                document.getElementById('preload_status').innerText = 'ENS resolver only available for mainnet.';
                return;
            }
        } else {
            document.getElementById('preload_status').innerText = 'Preload available for this model.';
            return;
        }
        document.getElementById('preload_button').disabled = true;

        found = 0;
        added = {};

        var chunks = Math.floor(temp.length/45);
        for (let i = 0; i < chunks; i++) {
            var contract_string = temp.map(item => item['address']).slice(i*45, (i+1)*45);
            contract_string = contract_string.join('&contractAddresses[]=');
            await fetch(`https://${chain}-mainnet.g.alchemy.com/v2/yQIn2v-52S5IEE-JjzJUx0HoFFSpvE2k/getNFTsForOwner?owner=${address}&withMetadata=false${contract_string}&pageSize=100`, options)
                .then(response => response.json())
                .then((response) => {
                    document.getElementById('suggest').scrollIntoView();                    
                    response.ownedNfts.forEach((nft) => {
                        present = projects[projects.findIndex(entry => entry['address'] === nft.contract.address)];
                        if (present && !(nft.contract.address in excluded) && !(nft.contract.address in added)) {
                            if (found == 0) {
                                chosen = {};
                                suggested = [];
                            }
                            added[nft.contract.address] = true;
                            updateSugg(nft.contract.address, false);
                            found++;
                        }
                    });
                    if (found > 0) document.getElementById('preload_status').innerText = `Added ${found} projects.`;
                })
                .catch((err) => {
                    console.error(err)
                    document.getElementById('preload_status').innerHTML = ` <font color="red">Error: ${err}</font>.`;
                });
        }
        if (found > 0) {
            document.getElementById('preload_status').innerText = `Done. Added ${found} projects.`;
            let viewed_addr = address.substring(0,2) == '0x' ? address.substring(0, 6) : address;
            document.getElementById('count_badge').innerText = `${viewed_addr}'s collection (${found})`;
            document.getElementById('count_badge_2').innerText = `${viewed_addr}'s collection (${found})`;
        } else {
            document.getElementById('preload_status').innerText = `Done. Owned NFTs not in snapshot.`;                    
        }
        setTimeout(function () { document.getElementById('preload_button').disabled = false; }, 4000);
    }
}
