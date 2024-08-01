const itemsPerPage = 5;
let currentPage = 1;

function renderGrid() {
    const gridContainer = document.getElementById('grid-container');
    gridContainer.innerHTML = '';

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = items.slice(start, end);

    pageItems.forEach(item => {
        const gridItem = document.createElement('div');
        gridItem.className = 'grid-item';

        const img = document.createElement('img');
        img.src = item.img;
        img.alt = item.title;
        img.addEventListener('click', () => openModal(item.img));
        
        const title = document.createElement('h2');
        title.textContent = item.title;

        const table = document.createElement('table');
        item.table.forEach(row => {
            const tr = document.createElement('tr');
            row.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell;
                tr.appendChild(td);
            });
            table.appendChild(tr);
        });

        gridItem.appendChild(img);
        gridItem.appendChild(title);
        gridItem.appendChild(table);
        gridContainer.appendChild(gridItem);
    });

    renderPagination();
}

function renderPagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    const totalPages = Math.ceil(items.length / itemsPerPage);
    
    const createButton = (text, page) => {
        const button = document.createElement('button');
        button.textContent = text;
        if (currentPage === page) button.classList.add('active');
        button.addEventListener('click', () => {
            currentPage = page;
            renderGrid();
        });
        return button;
    };

    if (currentPage > 1) {
        const prevButton = createButton('Preview', currentPage - 1);
        pagination.appendChild(prevButton);
    }

    const startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(totalPages, currentPage + 1);

    if (startPage > 1) {
        pagination.appendChild(createButton('1', 1));
        if (startPage > 2) {
            const ellipsis = document.createElement('button');
            ellipsis.textContent = '...';
            ellipsis.classList.add('ellipsis');
            pagination.appendChild(ellipsis);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        pagination.appendChild(createButton(i, i));
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('button');
            ellipsis.textContent = '...';
            ellipsis.classList.add('ellipsis');
            pagination.appendChild(ellipsis);
        }
        pagination.appendChild(createButton(totalPages, totalPages));
    }

    if (currentPage < totalPages) {
        const nextButton = createButton('Next', currentPage + 1);
        pagination.appendChild(nextButton);
    }
}

function openModal(src) {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');

    modal.style.display = 'flex';
    modalImg.src = src;
}

document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('image-modal').style.display = 'none';
});

window.addEventListener('click', (e) => {
    const modal = document.getElementById('image-modal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Initial render
renderGrid();
