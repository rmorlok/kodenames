export type Team = 'red' | 'blue';

export function reverseTeam(team: Team): Team {
    if (team === 'red') {
        return 'blue';
    } else {
        return 'red';
    }
}
