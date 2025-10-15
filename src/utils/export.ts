import { InternWithScore } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportToCSV(interns: InternWithScore[], week: string) {
    const headers = [
        'Rank',
        'Name',
        'Role',
        'Growth',
        'Creativity',
        'Proactivity',
        'Leadership/Collaboration',
        'Bonus',
        'Total Score'
    ];

    const rows = interns.map(intern => [
        intern.rank,
        intern.profile.name,
        intern.weeklyMetrics.role,
        intern.score.growth,
        intern.score.creativity,
        intern.score.proactivity,
        intern.weeklyMetrics.role === 'Strategist' ? intern.score.leadership : intern.score.collaboration,
        intern.score.bonus,
        intern.score.total
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `studio-x-leaderboard-${week}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function exportToPDF(interns: InternWithScore[], week: string) {
    const doc = new jsPDF();

    // Add Studio X branding
    doc.setFillColor(21, 63, 42); // Studio Forest Green
    doc.rect(0, 0, 210, 40, 'F');

    // Studio X Logo (text version)
    doc.setTextColor(201, 233, 96); // Studio X lime green
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('SX', 20, 20);

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Studio X Intern Leaderboard', 105, 20, { align: 'center' });

    // Subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`The Spot Where Growth Thrives - ${week}`, 105, 30, { align: 'center' });

    // Table data
    const headers = [
        ['Rank', 'Name', 'Role', 'Growth', 'Creativity', 'Proactivity', 'Lead/Collab', 'Bonus', 'Total']
    ];

    const rows = interns.map(intern => [
        intern.rank,
        intern.profile.name,
        intern.weeklyMetrics.role,
        intern.score.growth,
        intern.score.creativity,
        intern.score.proactivity,
        intern.weeklyMetrics.role === 'Strategist' ? (intern.score.leadership || 0) : (intern.score.collaboration || 0),
        intern.score.bonus || 0,
        intern.score.total
    ]);

    autoTable(doc, {
        head: headers,
        body: rows,
        startY: 50,
        theme: 'grid',
        headStyles: {
            fillColor: [21, 63, 42], // Studio Forest Green
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 10,
        },
        bodyStyles: {
            fontSize: 9,
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245],
        },
        columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 35 },
            2: { cellWidth: 25 },
            8: { fontStyle: 'bold', textColor: [21, 63, 42] },
        },
        didDrawCell: (data: any) => {
            // Highlight top 3
            if (data.section === 'body' && data.column.index === 0) {
                const rank = data.cell.raw;
                if (rank === 1) {
                    doc.setFillColor(201, 233, 96); // Lime green for rank 1
                    doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
                    doc.setTextColor(30, 30, 30);
                    doc.text('🥇 1', data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 2, { align: 'center' });
                }
            }
        },
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
        'Every metric tells a story of growth - Studio X',
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
    );

    doc.save(`studio-x-leaderboard-${week}.pdf`);
}
