export function formatData(userData: any[]): any[] {
    return userData.map(user => ({
        name: user.name,
        email: user.email,
        dateOfBirth: formatDate(user.dateOfBirth),
        // Add more fields as necessary
    }));
}

export function formatDate(date: string | Date): string {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(date).toLocaleDateString('en-US', options);
}