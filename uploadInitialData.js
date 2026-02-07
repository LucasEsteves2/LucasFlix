// Script para fazer upload dos dados iniciais para o Firebase
// Execute com: node uploadInitialData.js

const initialData = {
  "version": 1,
  "people": [
    {
      "id": "p1",
      "name": "Thiago",
      "stats": {
        "totalSessions": 2,
        "totalSurvived": 2,
        "totalSlept": 0,
        "totalNaps": 0,
        "totalSleepMinutes": 0,
        "consecutiveSurvived": 2,
        "longestAwakeStreak": 2,
        "warmupWins": 0,
        "warmupGames": 0,
        "timesSleptFirst": 0
      },
      "achievements": [
        {
          "achievementId": "first_survivor",
          "unlockedAt": "2026-02-01T10:33:42.175Z",
          "sessionId": "1769942022171-cb98r0zwu"
        },
        {
          "achievementId": "first_session",
          "unlockedAt": "2026-02-01T10:33:42.175Z",
          "sessionId": "1769942022171-cb98r0zwu"
        }
      ],
      "lastUpdated": "2026-02-07T05:32:48.385Z"
    },
    {
      "id": "p2",
      "name": "Diego",
      "stats": {
        "totalSessions": 2,
        "totalSurvived": 1,
        "totalSlept": 1,
        "totalNaps": 1,
        "totalSleepMinutes": 9.793133333333333,
        "consecutiveSurvived": 0,
        "longestAwakeStreak": 1,
        "warmupWins": 0,
        "warmupGames": 0,
        "timesSleptFirst": 1
      },
      "achievements": [
        {
          "achievementId": "first_survivor",
          "unlockedAt": "2026-02-01T10:33:42.175Z",
          "sessionId": "1769942022171-cb98r0zwu"
        },
        {
          "achievementId": "first_session",
          "unlockedAt": "2026-02-01T10:33:42.175Z",
          "sessionId": "1769942022171-cb98r0zwu"
        }
      ],
      "lastUpdated": "2026-02-07T05:32:48.385Z"
    },
    {
      "id": "p3",
      "name": "Menta",
      "stats": {
        "totalSessions": 2,
        "totalSurvived": 1,
        "totalSlept": 1,
        "totalNaps": 1,
        "totalSleepMinutes": 35.71665,
        "consecutiveSurvived": 1,
        "longestAwakeStreak": 1,
        "warmupWins": 0,
        "warmupGames": 0,
        "timesSleptFirst": 0
      },
      "achievements": [
        {
          "achievementId": "first_session",
          "unlockedAt": "2026-02-01T10:33:42.175Z",
          "sessionId": "1769942022171-cb98r0zwu"
        },
        {
          "achievementId": "first_survivor",
          "unlockedAt": "2026-02-07T05:32:48.386Z",
          "sessionId": "1770442368384-wqcirii62"
        }
      ],
      "lastUpdated": "2026-02-07T05:32:48.386Z"
    },
    {
      "id": "p4",
      "name": "Lucas",
      "stats": {
        "totalSessions": 2,
        "totalSurvived": 2,
        "totalSlept": 0,
        "totalNaps": 0,
        "totalSleepMinutes": 0,
        "consecutiveSurvived": 2,
        "longestAwakeStreak": 2,
        "warmupWins": 1,
        "warmupGames": 2,
        "timesSleptFirst": 0
      },
      "achievements": [
        {
          "achievementId": "first_survivor",
          "unlockedAt": "2026-02-01T10:33:42.175Z",
          "sessionId": "1769942022171-cb98r0zwu"
        },
        {
          "achievementId": "first_session",
          "unlockedAt": "2026-02-01T10:33:42.175Z",
          "sessionId": "1769942022171-cb98r0zwu"
        }
      ],
      "lastUpdated": "2026-02-07T05:32:48.385Z"
    },
    {
      "id": "p5",
      "name": "Julia",
      "isAlternative": true,
      "stats": {
        "totalSessions": 0,
        "totalSurvived": 0,
        "totalSlept": 0,
        "totalNaps": 0,
        "totalSleepMinutes": 0,
        "consecutiveSurvived": 0,
        "longestAwakeStreak": 0,
        "warmupWins": 0,
        "warmupGames": 0,
        "timesSleptFirst": 0
      },
      "achievements": [],
      "lastUpdated": "2026-02-01T05:56:53.238Z"
    },
    {
      "id": "p6",
      "name": "Valesca",
      "isAlternative": true,
      "stats": {
        "totalSessions": 0,
        "totalSurvived": 0,
        "totalSlept": 0,
        "totalNaps": 0,
        "totalSleepMinutes": 0,
        "consecutiveSurvived": 0,
        "longestAwakeStreak": 0,
        "warmupWins": 0,
        "warmupGames": 0,
        "timesSleptFirst": 0
      },
      "achievements": [],
      "lastUpdated": "2026-02-01T05:56:53.238Z"
    },
    {
      "id": "p7",
      "name": "Vitória",
      "isAlternative": true,
      "stats": {
        "totalSessions": 1,
        "totalSurvived": 0,
        "totalSlept": 1,
        "totalNaps": 1,
        "totalSleepMinutes": 71.90378333333334,
        "consecutiveSurvived": 0,
        "longestAwakeStreak": 0,
        "warmupWins": 0,
        "warmupGames": 0,
        "timesSleptFirst": 1
      },
      "achievements": [
        {
          "achievementId": "first_session",
          "unlockedAt": "2026-02-01T10:33:42.175Z",
          "sessionId": "1769942022171-cb98r0zwu"
        }
      ],
      "lastUpdated": "2026-02-01T10:33:42.175Z"
    },
    {
      "id": "p8",
      "name": "Lucca",
      "isAlternative": true,
      "stats": {
        "totalSessions": 1,
        "totalSurvived": 0,
        "totalSlept": 1,
        "totalNaps": 1,
        "totalSleepMinutes": 71.8706,
        "consecutiveSurvived": 0,
        "longestAwakeStreak": 0,
        "warmupWins": 0,
        "warmupGames": 0,
        "timesSleptFirst": 0
      },
      "achievements": [
        {
          "achievementId": "first_session",
          "unlockedAt": "2026-02-01T10:33:42.175Z",
          "sessionId": "1769942022171-cb98r0zwu"
        }
      ],
      "lastUpdated": "2026-02-01T10:33:42.175Z"
    }
  ],
  "sessions": [
    {
      "dateISO": "2026-02-01",
      "participantIds": [
        "p1",
        "p2",
        "p3",
        "p8",
        "p7",
        "p4"
      ],
      "participants": [
        {
          "personId": "p1",
          "naps": 0,
          "totalSleepTime": 0,
          "sleptFirst": false
        },
        {
          "personId": "p2",
          "naps": 0,
          "totalSleepTime": 0,
          "sleptFirst": false
        },
        {
          "personId": "p3",
          "naps": 1,
          "totalSleepTime": 35.71665,
          "sleptFirst": false,
          "sleepTime": "06:57"
        },
        {
          "personId": "p8",
          "naps": 1,
          "totalSleepTime": 71.8706,
          "sleptFirst": false,
          "sleepTime": "06:21"
        },
        {
          "personId": "p7",
          "naps": 1,
          "totalSleepTime": 71.90378333333334,
          "sleptFirst": true,
          "sleepTime": "06:21"
        },
        {
          "personId": "p4",
          "naps": 0,
          "totalSleepTime": 0,
          "sleptFirst": false
        }
      ],
      "movies": [],
      "warmUp": {
        "playerPersonId": "p4",
        "result": "GANHOU"
      },
      "sleepTimes": [
        {
          "personId": "p7",
          "time": "06:21"
        },
        {
          "personId": "p8",
          "time": "06:21"
        },
        {
          "personId": "p3",
          "time": "06:57"
        }
      ],
      "firstSleeperPersonId": "p7",
      "naps": {
        "p7": 1,
        "p8": 1,
        "p3": 1
      },
      "totalSleepTime": {
        "p7": 71.90378333333334,
        "p8": 71.8706,
        "p3": 35.71665
      },
      "id": "1769942022171-cb98r0zwu"
    },
    {
      "dateISO": "2026-02-07",
      "participantIds": [
        "p1",
        "p2",
        "p3",
        "p4"
      ],
      "participants": [
        {
          "personId": "p1",
          "naps": 0,
          "totalSleepTime": 0,
          "sleptFirst": false
        },
        {
          "personId": "p2",
          "naps": 1,
          "totalSleepTime": 9.793133333333333,
          "sleptFirst": true,
          "sleepTime": "00:54"
        },
        {
          "personId": "p3",
          "naps": 0,
          "totalSleepTime": 0,
          "sleptFirst": false
        },
        {
          "personId": "p4",
          "naps": 0,
          "totalSleepTime": 0,
          "sleptFirst": false
        }
      ],
      "movies": [],
      "warmUp": {
        "playerPersonId": "p4",
        "result": "PERDEU"
      },
      "sleepTimes": [
        {
          "personId": "p2",
          "time": "00:54"
        }
      ],
      "firstSleeperPersonId": "p2",
      "naps": {
        "p2": 1
      },
      "totalSleepTime": {
        "p2": 9.793133333333333
      },
      "id": "1770442368384-wqcirii62"
    }
  ],
  "dailyMovies": [],
  "votes": [],
  "shameWall": [
    {
      "dateISO": "2026-02-01",
      "personId": "p7",
      "time": "06:21",
      "id": "1769942022173-vo1t00qz6"
    },
    {
      "dateISO": "2026-02-01",
      "personId": "p8",
      "time": "06:21",
      "id": "1769942022173-s53hyzjqx"
    },
    {
      "dateISO": "2026-02-01",
      "personId": "p3",
      "time": "06:57",
      "id": "1769942022173-7ee70p179"
    },
    {
      "dateISO": "2026-02-07",
      "personId": "p2",
      "time": "00:54",
      "id": "1770442368385-sut9d0jfs"
    }
  ]
};

// Para fazer upload, você pode:
// 1. Usar o console do Firebase: https://console.firebase.google.com/
// 2. Ir em Realtime Database
// 3. Clicar nos 3 pontos > "Import JSON"
// 4. Colar o JSON acima

// Ou use este fetch direto (substitua pela sua URL):
async function uploadData() {
  try {
    const response = await fetch('https://lucasflix-default-rtdb.firebaseio.com/lucasflix.json', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(initialData)
    });
    
    if (response.ok) {
      console.log('✅ Dados carregados com sucesso no Firebase!');
      console.log('URL:', 'https://lucasflix-default-rtdb.firebaseio.com/lucasflix.json');
    } else {
      console.error('❌ Erro ao carregar dados:', response.statusText);
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Execute esta função no console do navegador ou com Node.js
uploadData();
console.log('📦 Fazendo upload dos dados iniciais...');

