# Synchronizes the firestore database with the Excel sheet

import pandas as pd
import random
from services.firebase import Firebase

if __name__ == "__main__":
    firebase = Firebase()

    scout_df = pd.read_csv('scout.csv')

    # update movies doc
    for index, row in scout_df.iterrows():
        matchDict = row.to_dict()
        try:
            matchDict['alliance'] = 'blue' if matchDict['alliance'] == 'b' else 'red'

            matchDict['attemptHang'] = True if matchDict['attemptHang'] == 'TRUE' else False
            matchDict['attemptLevel'] = True if matchDict['attemptLevel'] == 'TRUE' else False

            matchDict['autonBottom'] = int(matchDict['autonBottom'])
            matchDict['autonBottomMissed'] = int(matchDict['autonBottomMissed'])
            matchDict['autonInner'] = int(matchDict['autonInner'])
            matchDict['autonInnerMissed'] = int(matchDict['autonInnerMissed'])
            matchDict['autonUpper'] = int(matchDict['autonUpper'])
            matchDict['autonUpperMissed'] = int(matchDict['autonUpperMissed'])

            matchDict['buddy'] = True if matchDict['buddy'] == 'TRUE' else False
            
            matchDict['climbTime'] = random.randint(1700, 6000)

            matchDict['comments'] = matchDict['comments']

            matchDict['cycles'] = int(matchDict['cycles'])

            matchDict['defense'] = True if matchDict['defense'] == 'TRUE' else False
            matchDict['disabled'] = True if matchDict['disabled'] == 'TRUE' else False

            matchDict['hangFail'] = True if matchDict['hangFail'] == 'TRUE' else False
            matchDict['initLineCrosses'] = True if matchDict['initLineCrosses'] == 'TRUE' else False
            matchDict['levelFail'] = True if matchDict['levelFail'] == 'TRUE' else False

            matchDict['matchNum'] = int(matchDict['match'])
            matchDict['minfo'] = matchDict['minfo']

            matchDict['position'] = True if matchDict['position'] == 'TRUE' else False
            matchDict['preloads'] = int(matchDict['match'])
            matchDict['rotation'] = True if matchDict['rotation'] == 'TRUE' else False

            matchDict['startLocations'] = f"{matchDict['startLocation1']},{matchDict['startLocation2']},{matchDict['startLocation3']}"
            matchDict['startLocations'] = matchDict['startLocations'].lower()

            matchDict['stuck'] = True if matchDict['stuck'] == 'TRUE' else False
            matchDict['teamNum'] = int(matchDict['teamNum'])

            matchDict['teleopBottom'] = int(matchDict['teleopBottom'])
            matchDict['teleopBottomMissed'] = int(matchDict['teleopBottomMissed'])
            matchDict['teleopInner'] = int(matchDict['teleopInner'])
            matchDict['teleopInnerMissed'] = int(matchDict['teleopInnerMissed'])
            matchDict['teleopUpper'] = int(matchDict['teleopUpper'])
            matchDict['teleopUpperMissed'] = int(matchDict['teleopUpperMissed'])

            matchDict['trench'] = True if matchDict['trench'] == 'TRUE' else False

            try:
                firebase.update_match(matchDict['regional'], matchDict['matchNum'], matchDict['alliance'], matchDict['teamNum'], matchDict)
                firebase.update_team(matchDict['regional'], matchDict['matchNum'], matchDict['teamNum'], matchDict)
            except Exception as e:
                print(f'could not update {index}, {str(e)}')
        except Exception as e:
            print(f'unable to update row {index}, {str(e)}')
