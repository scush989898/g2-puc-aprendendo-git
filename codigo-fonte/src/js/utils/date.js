export function standardizeDate(date = null, useTimeZoneOffset = true) {
    if (!date) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const day = now.getDate();

        const brazilDate = new Date(year, month, day, 12, 0, 0);
        return brazilDate.toISOString();
    }

    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        const [year, month, day] = date.split('-').map(Number);
        const brazilDate = new Date(year, month - 1, day, 12, 0, 0);
        return brazilDate.toISOString();
    }

    const baseDate = new Date(date);
    if (useTimeZoneOffset) {
        const brazilDateStr = baseDate.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' });
        const brazilDate = new Date(brazilDateStr);
        brazilDate.setHours(12, 0, 0, 0);
        return brazilDate.toISOString();
    }

    return baseDate.toISOString();
}

export function configureInputDateFormat() {
    const dateInputs = document.querySelectorAll('input[type="date"]');

    dateInputs.forEach(input => {
        input.addEventListener('focus', function (e) {
            this.setAttribute('placeholder', 'DD/MM/AAAA');
        });
    });
}

export function dateToHtmlInputFormat(date) {
    if (!date) return '';

    const dateObj = new Date(date);
    const brazilDate = new Date(dateObj.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    brazilDate.setHours(12, 0, 0, 0);

    const year = brazilDate.getFullYear();
    const month = String(brazilDate.getMonth() + 1).padStart(2, '0');
    const day = String(brazilDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}


export function formatDateForDisplay(date, options = {}) {
    if (!date) return 'Sem data';

    const dateObj = new Date(date);

    const brazilDate = new Date(dateObj.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    brazilDate.setHours(12, 0, 0, 0);

    return brazilDate.toLocaleDateString('pt-BR', options);
}

