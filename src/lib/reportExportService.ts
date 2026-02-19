import { DbParticipantRegistration } from './database';

export interface RegistrationReportRow extends DbParticipantRegistration {
  training_name: string;
  training_type: string;
  session_date: string;
}

/**
 * Export registration report data to CSV format
 */
export function exportToCSV(
  data: RegistrationReportRow[],
  filename: string = 'registration_report.csv'
): void {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  // Define CSV headers
  const headers = [
    'Registration Reference',
    'Participant Name',
    'Email',
    'Mobile Number',
    'Position',
    'FCP Number',
    'FCP Name',
    'Cluster',
    'Region',
    'Training Name',
    'Training Type',
    'Session Date',
    'Registered At',
    'Attendance Confirmed',
    'Attending With Baby',
  ];

  // Convert data to CSV rows
  const rows = data.map(row => [
    row.registration_reference,
    row.participant_name,
    row.email_address,
    row.mobile_number,
    row.participant_position,
    row.fcp_number,
    row.fcp_name,
    row.cluster,
    row.region,
    row.training_name,
    row.training_type,
    row.session_date,
    new Date(row.registered_at).toLocaleString(),
    row.attendance_confirmed ? 'Yes' : 'No',
    row.attending_with_baby ? 'Yes' : 'No',
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export registration report data to PDF format
 * This creates a simple PDF using browser print functionality
 */
export function exportToPDF(
  data: RegistrationReportRow[],
  statistics: {
    totalRegistrations: number;
    confirmedAttendance: number;
    withBaby: number;
    byRegion: Record<string, number>;
    byCluster: Record<string, number>;
  },
  filters: {
    startDate?: string;
    endDate?: string;
    trainingType?: string;
    region?: string;
    cluster?: string;
  }
): void {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export PDF');
    return;
  }

  // Build HTML content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Participant Registration Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          color: #333;
        }
        h1 {
          color: #0f766e;
          border-bottom: 3px solid #0f766e;
          padding-bottom: 10px;
        }
        h2 {
          color: #0f766e;
          margin-top: 30px;
        }
        .header-info {
          background: #f0fdfa;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 30px;
        }
        .stat-card {
          background: #f8fafc;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #0f766e;
        }
        .stat-label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
        }
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #0f766e;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          font-size: 11px;
        }
        th {
          background: #0f766e;
          color: white;
          padding: 10px;
          text-align: left;
          font-weight: 600;
        }
        td {
          padding: 8px;
          border-bottom: 1px solid #e2e8f0;
        }
        tr:nth-child(even) {
          background: #f8fafc;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #e2e8f0;
          font-size: 10px;
          color: #64748b;
        }
        @media print {
          body { padding: 10px; }
          .stat-card { page-break-inside: avoid; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
        }
      </style>
    </head>
    <body>
      <h1>Participant Registration Report</h1>
      
      <div class="header-info">
        <strong>Report Generated:</strong> ${new Date().toLocaleString()}<br>
        ${filters.startDate ? `<strong>Date Range:</strong> ${filters.startDate} to ${filters.endDate || 'Present'}<br>` : ''}
        ${filters.trainingType && filters.trainingType !== 'all' ? `<strong>Training Type:</strong> ${filters.trainingType}<br>` : ''}
        ${filters.region && filters.region !== 'all' ? `<strong>Region:</strong> ${filters.region}<br>` : ''}
        ${filters.cluster && filters.cluster !== 'all' ? `<strong>Cluster:</strong> ${filters.cluster}<br>` : ''}
      </div>

      <h2>Summary Statistics</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total Registrations</div>
          <div class="stat-value">${statistics.totalRegistrations}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Confirmed Attendance</div>
          <div class="stat-value">${statistics.confirmedAttendance}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">With Baby</div>
          <div class="stat-value">${statistics.withBaby}</div>
        </div>
      </div>

      <h2>Registrations by Region</h2>
      <table>
        <thead>
          <tr>
            <th>Region</th>
            <th>Count</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(statistics.byRegion)
            .sort(([, a], [, b]) => b - a)
            .map(([region, count]) => `
              <tr>
                <td>${region}</td>
                <td>${count}</td>
                <td>${Math.round((count / statistics.totalRegistrations) * 100)}%</td>
              </tr>
            `).join('')}
        </tbody>
      </table>

      <h2>Registration Details</h2>
      <table>
        <thead>
          <tr>
            <th>Ref</th>
            <th>Name</th>
            <th>Email</th>
            <th>Position</th>
            <th>FCP</th>
            <th>Region</th>
            <th>Training</th>
            <th>Date</th>
            <th>Confirmed</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              <td>${row.registration_reference}</td>
              <td>${row.participant_name}</td>
              <td>${row.email_address}</td>
              <td>${row.participant_position}</td>
              <td>${row.fcp_name}</td>
              <td>${row.region}</td>
              <td>${row.training_name}</td>
              <td>${new Date(row.session_date).toLocaleDateString()}</td>
              <td>${row.attendance_confirmed ? '✓' : '✗'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>This report was generated automatically by the Training Management System.</p>
        <p>Total records: ${data.length}</p>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load then print
  printWindow.onload = () => {
    printWindow.print();
  };
}
