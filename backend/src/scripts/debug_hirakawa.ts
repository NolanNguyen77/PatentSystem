
import prisma from '../config/database';

async function debugHirakawa() {
    try {
        console.log('Debugging Title Hirakawa (000032)...');

        const title = await prisma.title.findFirst({
            where: { titleNo: '000032' },
            include: { patents: true }
        });

        if (!title) {
            console.log('Title 000032 not found!');
            return;
        }

        console.log(`Found Title: ${title.titleName} (ID: ${title.id})`);
        console.log(`Total Patents: ${title.patents.length}`);

        const evaluatedPatents = title.patents.filter((p: any) => p.evaluationStatus && p.evaluationStatus !== '未評価');
        console.log(`Evaluated Patents (valid): ${evaluatedPatents.length}`);

        console.log('--- Patent Details ---');
        title.patents.forEach((p: any, index: number) => {
            console.log(`[${index + 1}] ID: ${p.id}, DocNum: ${p.documentNum}, Status: '${p.evaluationStatus}' (Type: ${typeof p.evaluationStatus})`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugHirakawa();
