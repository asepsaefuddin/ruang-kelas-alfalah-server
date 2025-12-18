import express from 'express';
import ExcelGenerator from './services/excelGenerator';
import fs from 'fs';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const excelGenerator = new ExcelGenerator();
// menambah
app.post('/generate-template', async (req, res) => {
    try {
        const userData = req.body;
        const workbook = excelGenerator.generateTemplate(userData);
        const filePath = await excelGenerator.saveTemplate(workbook, 'template.xlsx');
        
        res.download(filePath, 'template.xlsx', (err) => {
            if (err) {
                console.error('Download error:', err);
            }
            // Clean up the file after download
            try {
                fs.unlinkSync(filePath);
            } catch (unlinkErr) {
                console.error('Error deleting temp file:', unlinkErr);
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to generate template' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});