require('dotenv').config();
const connectDB = require('./connection');
const Skill = require('./models/skillModel');
const Career = require('./models/careerModel');

const run = async () => {
    await connectDB();

    const skills = [
        { name: 'React', category: 'Frontend', description: 'Building interfaces with React.js' },
        { name: 'JavaScript', category: 'Programming', description: 'Core JavaScript development' },
        { name: 'Python', category: 'Programming', description: 'Python programming and scripting' },
        { name: 'SQL', category: 'Database', description: 'Working with relational databases' },
        { name: 'System Design', category: 'Software Engineering', description: 'Designing scalable software systems' },
        { name: 'Figma', category: 'Design', description: 'UI/UX design and prototyping' },
        { name: 'Research', category: 'Design', description: 'User and product research' },
        { name: 'Prototyping', category: 'Design', description: 'Creating interactive product prototypes' },
        { name: 'Linux', category: 'Infrastructure', description: 'Linux systems and command line' },
        { name: 'Networks', category: 'Infrastructure', description: 'Computer networking fundamentals' },
        { name: 'Cloud', category: 'Cloud', description: 'Cloud computing fundamentals' },
        { name: 'Git', category: 'Development Tools', description: 'Version control with Git' }
    ];

    await Skill.bulkWrite(
        skills.map(skill => ({
            updateOne: {
                filter: { name: skill.name },
                update: { $set: skill },
                upsert: true
            }
        }))
    );

    await Career.updateOne(
        { name: 'Software Developer' },
        { $set: { requiredSkills: ['JavaScript', 'System Design', 'Git'] } }
    );

    await Career.updateOne(
        { name: 'Data Science' },
        { $set: { requiredSkills: ['Python', 'SQL'] } }
    );

    await Career.updateOne(
        { name: 'Cybersecurity Analyst' },
        { $set: { requiredSkills: ['Networks', 'Linux'] } }
    );

    await Career.updateOne(
        { name: 'Product Designer' },
        { $set: { requiredSkills: ['Figma', 'Research', 'Prototyping'] } }
    );

    console.log('Skills and career skill requirements seeded.');
    process.exit(0);
};

run().catch(error => {
    console.error(error);
    process.exit(1);
});