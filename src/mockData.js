// This is a temporary file to load some mock data for the user to see
export const loadMockData = () => {
    const mockVotes = [
        { name: 'Alice', dates: [9, 10, 16, 17, 23, 24] },
        { name: 'Bob', dates: [10, 17, 24, 31] },
        { name: 'Charlie', dates: [9, 16, 23] },
        { name: 'David', dates: [10, 11, 17, 18, 24, 25] },
    ];
    if (!localStorage.getItem('partyVotes')) {
        localStorage.setItem('partyVotes', JSON.stringify(mockVotes));
        console.log('Mock data loaded');
    }
};
