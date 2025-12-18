import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

interface User {
    name: string;
    email: string;
    dob: string;
    joinedDate: string;
}

class ExcelGenerator {
    generateTemplate(users: User[]): ExcelJS.Workbook {
        // Logic to create an Excel file based on user data
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Users');

        // Define columns
        worksheet.columns = [
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Date of Birth', key: 'dob', width: 15 },
            { header: 'Joined Date', key: 'joinedDate', width: 15 },
        ];

        // Add rows
        users.forEach(user => {
            worksheet.addRow({
                name: user.name,
                email: user.email,
                dob: user.dob,
                joinedDate: user.joinedDate,
            });
        });

        return workbook;
    }

    async saveTemplate(workbook: ExcelJS.Workbook, filename: string): Promise<string> {
        // Save to temp directory
        const tempDir = path.join(__dirname, '../../temp');
        
        // Create temp directory if it doesn't exist
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const filePath = path.join(tempDir, filename);
        await workbook.xlsx.writeFile(filePath);
        return filePath;
    }
}

export default ExcelGenerator;