const API_KEY = "jbcih-NmTTsmmRfBE_qtBS-obOk";
const API_URL = "https://ci-jshint.herokuapp.com/api"
const resultsModal = new bootstrap.Modal(document.getElementById("resultsModal"));

document.getElementById("status").addEventListener("click", e => getStatus(e));
document.getElementById("submit").addEventListener("click", e => postForm(e));

async function getStatus(e) {
    const queryString = `${API_URL}?api_key=${API_KEY}`;
    const response = await fetch(queryString);
    const data = await response.json();

    if (response.ok){
        displayStatus(data)
    } else {
        displayException(data);
        throw new Error(data.error);
    };
};

function displayStatus(data) {
    let headingText = document.getElementById("resultsModalTitle");
    headingText.innerText = "API Key Status";
    let contentText = document.getElementById("results-content");
    contentText.innerText = `Your key is valid until: \n${data.expiry}`;
    resultsModal.show();
};

function processOptions(form) {
    let optArray = [];
    for (let entry of form.entries()) {
        if (entry[0] === "options") {
            optArray.push(entry[1]);
        }
    }
    form.delete("options");
    form.append("options", optArray.join());
    return form;

};

async function postForm(e) {
    const form = processOptions(new FormData(document.getElementById("checksform")));
    const response = await fetch(API_URL, {
                        method: "POST",
                        headers: {
                                    "Authorization": API_KEY,
                                 },
                        body: form,
                        })
    const data = await response.json();

    if (response.ok) {
        displayErrors(data);
    } else {
        displayException(data);
        throw new Error(data.error);
    }
};

function displayErrors(data) {
    let heading = `JShint results for ${data.file}`;

    if (data.total_errors === 0) {
        results = `<div class="no-errors">No errors reported!</div>`;
    } else {
        results = `<div>Total errors:<span class="error-count">${data.total_errors}</span></div>`;
        for (let error of data.error_list) {
            results += `<div>At line <span class="line">${error.line}</span>, `;
            results += `column <span class="column">${error.col}</span></div>`;
            results += `<div class+"error">${error.error}</div>`;
        }
    }
    document.getElementById("resultsModalTitle").innerText = heading;
    document.getElementById("results-content").innerHTML = results;
    resultsModal.show();
}

function displayException(data) {
    let content = `<div>The API returned status code: <span>${data.status_code}</span></div>
    \n<div>Error number: <span>${data.error_no}</span><\div>
    \n<div>Error text: <span>${data.error}</span></div>`
    document.getElementById("resultsModalTitle").innerText = "An Exception Occurred.";
    document.getElementById("results-content").innerHTML = content;
    resultsModal.show();

}