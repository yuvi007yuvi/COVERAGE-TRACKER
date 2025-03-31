// Constants for DOM elements
const fileInput = document.getElementById('fileInput');
const totalsContainer = document.getElementById('totalsContainer');
const tableBody = document.getElementById('tableBody');
const loadingElement = document.createElement('div');

// Initialize loading element
loadingElement.className = 'loading';
loadingElement.innerHTML = `
    <div class="loading-spinner"></div>
    <p>Processing file...</p>
`;
document.body.insertBefore(loadingElement, totalsContainer);

// Event listeners
fileInput.addEventListener('change', handleFileUpload);

// File upload handler
async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
        showLoading();
        const contents = await readFile(file);
        processCSV(contents);
        hideLoading();
        showTotalsWithAnimation();
    } catch (error) {
        hideLoading();
        alert('Error processing file: ' + error.message);
    }
}

// File reader promise
function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

// CSV processing function
function processCSV(csv) {
    try {
        const lines = csv.trim().split('\n');
        if (lines.length < 2) throw new Error('File is empty or invalid');

        const headers = lines[0].split(',');
        validateHeaders(headers);

        let totalToday = 0;
        let totalYesterday = 0;
        tableBody.innerHTML = '';

        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '') continue;
            
            const cells = lines[i].split(',');
            if (cells.length < 3) throw new Error(`Invalid data at line ${i + 1}`);

            const { wardNo, wardName, today, yesterday, fluctuation } = processRow(cells);
            
            totalToday += today;
            totalYesterday += yesterday;

            appendTableRow(wardNo, wardName, today, yesterday, fluctuation);
        }

        updateTotals(totalToday, totalYesterday);
    } catch (error) {
        throw new Error(`CSV Processing Error: ${error.message}`);
    }
}

// Validate CSV headers
function validateHeaders(headers) {
    const requiredColumns = ['Ward', 'Today', 'Yesterday'];
    const headerStr = headers.join(',').toLowerCase();
    const valid = requiredColumns.every(col => 
        headerStr.includes(col.toLowerCase())
    );
    if (!valid) throw new Error('Invalid CSV format: Missing required columns');
}

// Process individual row
function processRow(cells) {
    const wardFull = cells[0].trim();
    const [wardNo, ...wardNameParts] = wardFull.split('-');
    const wardName = wardNameParts.join('-') || '';
    const today = parseInt(cells[1]) || 0;
    const yesterday = parseInt(cells[2]) || 0;
    const fluctuation = today - yesterday;

    return { wardNo, wardName, today, yesterday, fluctuation };
}

// Append row to table
function appendTableRow(wardNo, wardName, today, yesterday, fluctuation) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${wardNo}</td>
        <td>${wardName}</td>
        <td>${today}</td>
        <td>${yesterday}</td>
        <td class="${fluctuation >= 0 ? 'positive' : 'negative'}">${fluctuation}</td>
    `;
    tableBody.appendChild(row);
}

// Update totals section
function updateTotals(totalToday, totalYesterday) {
    const netChange = totalToday - totalYesterday;
    
    document.getElementById('totalToday').textContent = totalToday;
    document.getElementById('totalYesterday').textContent = totalYesterday;
    
    const netChangeElement = document.getElementById('netChange');
    netChangeElement.textContent = netChange;
    netChangeElement.className = netChange >= 0 ? 'positive' : 'negative';
}

// Loading state management
function showLoading() {
    loadingElement.classList.add('visible');
    totalsContainer.style.display = 'none';
    tableBody.innerHTML = '';
}

function hideLoading() {
    loadingElement.classList.remove('visible');
}

// Animation functions
function showTotalsWithAnimation() {
    totalsContainer.style.display = 'block';
    setTimeout(() => totalsContainer.classList.add('visible'), 50);
}