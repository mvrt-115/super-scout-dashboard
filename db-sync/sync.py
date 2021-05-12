# Synchronizes the firestore database with the Excel sheet

import pandas as pd
import random
from services.firebase import Firebase

if __name__ == "__main__":
    firebase = Firebase()

    scout_df = pd.read_csv('scout2.csv')

    # update movies doc

    for index, row in scout_df.iterrows():
        matchDict = row.to_dict()
        data = {}
        try:
            data['teamNum'] = int(matchDict['team'])

            data['regional'] = matchDict['tournament']
            data['matchNum'] = int(matchDict['match'])
            data['alliance'] = 'blue' if matchDict['alliance'] == 'b' else 'red'

            data['autonBottom'] = 2*int(matchDict['sandstorm_rocket_hatch_1']) + 2*int(matchDict['sandstorm_rocket_hatch_1']) + 3*int(matchDict['sandstorm_rocket_cargo_1']) + 3*int(matchDict['sandstorm_cargoship_cargo']) + 2*int(matchDict['sandstorm_cargoship_hatch'])
            data['autonInner'] = 2*int(matchDict['sandstorm_rocket_hatch_2']) + 3*int(matchDict["sandstorm_rocket_cargo_2"])
            data['autonUpper'] = 2*int(matchDict['sandstorm_rocket_hatch_3']) + 3*int(matchDict['sandstorm_rocket_cargo_3'])

            data['teleopBottom'] = 2*int(matchDict['teleop_rocket_hatch_1']) + 2*int(matchDict['teleop_rocket_hatch_1']) + 3*int(matchDict['teleop_rocket_cargo_1']) + 3*int(matchDict['teleop_cargoship_cargo']) + 2*int(matchDict['teleop_cargoship_hatch'])
            data['teleopInner'] = 2*int(matchDict['teleop_rocket_hatch_2']) + 3*int(matchDict["teleop_rocket_cargo_2"])
            data['teleopUpper'] = 2*int(matchDict['teleop_rocket_hatch_3']) + 3*int(matchDict['teleop_rocket_cargo_3'])

            data['attemptHang'] = True if "TRUE" in (str(matchDict['teleop_climb_1'])+str(matchDict['teleop_climb_2'])+str(matchDict['teleop_climb_3'])) else False
            data['hangFail'] = False if "TRUE" in (str(matchDict['teleop_climb_1'])+str(matchDict['teleop_climb_2'])+str(matchDict['teleop_climb_3'])) else True

            data['disabled'] = True if matchDict['disabled'] == 'TRUE' else False
            data['defense'] = True if matchDict['defense'] == 'TRUE' else False

            data['comments'] = matchDict['comment_scout']
            data['minfo'] = matchDict['match_id']
            
            try:
                firebase.update_match(data['regional'], data['matchNum'], data['alliance'], data['teamNum'], data)
                firebase.update_team(data['regional'], data['matchNum'], data['teamNum'], data)
            except Exception as e:
                print(f'could not update {index}, {str(e)}')
        except Exception as e:
            print(f'unable to update row {index}, {str(e)}')
            pass
