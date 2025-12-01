import pandas as pd
import numpy as np
from datetime import datetime
import pymongo
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
client = pymongo.MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/'))
db = client['surf-risk-analyzer']
surf_spots_collection = db['surfspots']
incidents_collection = db['incidents']

# Risk scoring data from your document
RISK_DATA = {
    'Hikkaduwa': {'total': 425, 'advanced': 20, 'beginner': 142, 'intermediate': 50},
    'Matara': {'total': 324, 'advanced': 5, 'beginner': 124, 'intermediate': 14},
    'Trincomalee': {'total': 298, 'advanced': 5, 'beginner': 74, 'intermediate': 19},
    'Arugam Bay': {'total': 293, 'advanced': 50, 'beginner': 69, 'intermediate': 34},
    'Unawatuna': {'total': 292, 'advanced': 45, 'beginner': 102, 'intermediate': 33},
    'Midigama': {'total': 256, 'advanced': 44, 'beginner': 63, 'intermediate': 68},
    'Point Pedro': {'total': 239, 'advanced': 0, 'beginner': 82, 'intermediate': 0},
    'Ahangama': {'total': 237, 'advanced': 31, 'beginner': 66, 'intermediate': 54},
    'Mirissa': {'total': 224, 'advanced': 32, 'beginner': 55, 'intermediate': 81},
    'Kalpitiya': {'total': 210, 'advanced': 0, 'beginner': 73, 'intermediate': 0},
    'Thalpe': {'total': 209, 'advanced': 40, 'beginner': 62, 'intermediate': 23},
    'Weligama': {'total': 200, 'advanced': 27, 'beginner': 87, 'intermediate': 18}
}

# Skill-specific thresholds
SKILL_THRESHOLDS = {
    'beginner': {
        'low': 5.0,      # 1-5 = Green Flag (Low Risk)
        'medium': 6.5    # 5-6.5 = Yellow Flag (Medium Risk), 6.5-10 = Red Flag (High Risk)
    },
    'intermediate': {
        'low': 6.0,      # 1-6 = Green Flag (Low Risk)
        'medium': 7.2    # 6-7.2 = Yellow Flag (Medium Risk), 7.2-10 = Red Flag (High Risk)
    },
    'advanced': {
        'low': 7.0,      # 1-7 = Green Flag (Low Risk)
        'medium': 8.0    # 7-8 = Yellow Flag (Medium Risk), 8-10 = Red Flag (High Risk)
    }
}

def calculate_risk_score(incidents_count, max_incidents, skill_multiplier=1.0):
    """
    Calculate risk score (0-10) based on incident count
    """
    if max_incidents == 0:
        return 0
    
    # Normalize to 0-10 scale
    base_score = (incidents_count / max_incidents) * 10
    
    # Apply skill multiplier
    risk_score = base_score * skill_multiplier
    
    # Cap at 10
    risk_score = min(10, risk_score)
    
    return round(risk_score, 2)

def get_risk_level_and_flag(score, skill_level):
    """
    Determine risk level and flag color based on score and skill level
    Uses custom thresholds for each skill level
    """
    thresholds = SKILL_THRESHOLDS.get(skill_level, SKILL_THRESHOLDS['beginner'])
    
    if score <= thresholds['low']:
        return ('Low', 'green')
    elif score <= thresholds['medium']:
        return ('Medium', 'yellow')
    else:
        return ('High', 'red')

def calculate_skill_based_risks():
    """
    Calculate risk scores for each skill level at each surf spot
    """
    print("Calculating skill-based risk scores with custom thresholds...")
    
    # Find max incidents for each skill level for normalization
    max_beginner = max([data['beginner'] for data in RISK_DATA.values()])
    max_intermediate = max([data['intermediate'] for data in RISK_DATA.values()])
    max_advanced = max([data['advanced'] for data in RISK_DATA.values()])
    
    print(f"Max incidents - Beginner: {max_beginner}, Intermediate: {max_intermediate}, Advanced: {max_advanced}")
    print(f"\nSkill-Specific Thresholds:")
    print(f"  Beginner:     Low (1-5.0) | Medium (5.0-6.5) | High (6.5-10)")
    print(f"  Intermediate: Low (1-6.0) | Medium (6.0-7.2) | High (7.2-10)")
    print(f"  Advanced:     Low (1-7.0) | Medium (7.0-8.0) | High (8.0-10)")
    
    results = []
    
    for spot_name, data in RISK_DATA.items():
        print(f"\n{spot_name}:")
        
        # Skill multipliers (beginners face higher risk from same number of incidents)
        beginner_multiplier = 1.5
        intermediate_multiplier = 1.0
        advanced_multiplier = 0.7
        
        # Calculate scores for each skill level
        beginner_score = calculate_risk_score(
            data['beginner'], 
            max_beginner, 
            beginner_multiplier
        )
        
        intermediate_score = calculate_risk_score(
            data['intermediate'], 
            max_intermediate, 
            intermediate_multiplier
        )
        
        advanced_score = calculate_risk_score(
            data['advanced'], 
            max_advanced, 
            advanced_multiplier
        )
        
        # Get risk levels and flags using skill-specific thresholds
        beginner_level, beginner_flag = get_risk_level_and_flag(beginner_score, 'beginner')
        intermediate_level, intermediate_flag = get_risk_level_and_flag(intermediate_score, 'intermediate')
        advanced_level, advanced_flag = get_risk_level_and_flag(advanced_score, 'advanced')
        
        # Calculate overall risk (weighted average)
        overall_score = (
            beginner_score * 0.5 +
            intermediate_score * 0.3 +
            advanced_score * 0.2
        )
        
        # Use beginner thresholds for overall risk (most conservative)
        overall_level, overall_flag = get_risk_level_and_flag(overall_score, 'beginner')
        
        result = {
            'spot_name': spot_name,
            'total_incidents': data['total'],
            'overall': {
                'score': round(overall_score, 2),
                'level': overall_level,
                'flag': overall_flag
            },
            'beginner': {
                'incidents': data['beginner'],
                'score': beginner_score,
                'level': beginner_level,
                'flag': beginner_flag
            },
            'intermediate': {
                'incidents': data['intermediate'],
                'score': intermediate_score,
                'level': intermediate_level,
                'flag': intermediate_flag
            },
            'advanced': {
                'incidents': data['advanced'],
                'score': advanced_score,
                'level': advanced_level,
                'flag': advanced_flag
            }
        }
        
        results.append(result)
        
        # Print results
        print(f"  Total Incidents: {data['total']}")
        print(f"  Overall: {overall_score}/10 ({overall_flag.upper()} - {overall_level})")
        print(f"  Beginner: {beginner_score}/10 ({beginner_flag.upper()} - {beginner_level}) [{data['beginner']} incidents]")
        print(f"  Intermediate: {intermediate_score}/10 ({intermediate_flag.upper()} - {intermediate_level}) [{data['intermediate']} incidents]")
        print(f"  Advanced: {advanced_score}/10 ({advanced_flag.upper()} - {advanced_level}) [{data['advanced']} incidents]")
    
    return results

def update_database_with_skill_risks():
    """
    Update MongoDB with skill-specific risk scores
    """
    print("\n" + "="*60)
    print("UPDATING DATABASE WITH SKILL-BASED RISK SCORES")
    print("="*60)
    
    results = calculate_skill_based_risks()
    
    print("\n" + "="*60)
    print("UPDATING SURF SPOTS IN DATABASE")
    print("="*60)
    
    for result in results:
        spot_name = result['spot_name']
        
        # Find surf spot in database
        surf_spot = surf_spots_collection.find_one({'name': spot_name})
        
        if not surf_spot:
            print(f"\n⚠️  Surf spot '{spot_name}' not found in database, skipping...")
            continue
        
        # Update with skill-specific data
        update_data = {
            'riskScore': result['overall']['score'],
            'riskLevel': result['overall']['level'],
            'flagColor': result['overall']['flag'],
            'totalIncidents': result['total_incidents'],
            'lastUpdated': datetime.now(),
            'skillLevelRisks': {
                'beginner': {
                    'incidents': result['beginner']['incidents'],
                    'riskScore': result['beginner']['score'],
                    'riskLevel': result['beginner']['level'],
                    'flagColor': result['beginner']['flag']
                },
                'intermediate': {
                    'incidents': result['intermediate']['incidents'],
                    'riskScore': result['intermediate']['score'],
                    'riskLevel': result['intermediate']['level'],
                    'flagColor': result['intermediate']['flag']
                },
                'advanced': {
                    'incidents': result['advanced']['incidents'],
                    'riskScore': result['advanced']['score'],
                    'riskLevel': result['advanced']['level'],
                    'flagColor': result['advanced']['flag']
                }
            }
        }
        
        # Update in database
        surf_spots_collection.update_one(
            {'_id': surf_spot['_id']},
            {'$set': update_data}
        )
        
        print(f"\n✅ Updated {spot_name}:")
        print(f"   Overall: {result['overall']['score']}/10 ({result['overall']['flag']})")
        print(f"   Beginner: {result['beginner']['score']}/10 ({result['beginner']['flag']})")
        print(f"   Intermediate: {result['intermediate']['score']}/10 ({result['intermediate']['flag']})")
        print(f"   Advanced: {result['advanced']['score']}/10 ({result['advanced']['flag']})")
    
    print("\n" + "="*60)
    print("✅ DATABASE UPDATE COMPLETE!")
    print("="*60)

def generate_risk_summary():
    """
    Generate a summary report of all surf spots by skill level
    """
    print("\n" + "="*80)
    print("SURF SPOT RISK SUMMARY BY SKILL LEVEL")
    print("="*80)
    
    results = calculate_skill_based_risks()
    
    # Sort by overall risk (highest first)
    results_sorted = sorted(results, key=lambda x: x['overall']['score'], reverse=True)
    
    print("\n" + "-"*80)
    print(f"{'Surf Spot':<15} {'Overall':<12} {'Beginner':<12} {'Intermediate':<12} {'Advanced':<12}")
    print("-"*80)
    
    for result in results_sorted:
        overall_display = f"{result['overall']['score']} {result['overall']['flag'][0].upper()}"
        beginner_display = f"{result['beginner']['score']} {result['beginner']['flag'][0].upper()}"
        intermediate_display = f"{result['intermediate']['score']} {result['intermediate']['flag'][0].upper()}"
        advanced_display = f"{result['advanced']['score']} {result['advanced']['flag'][0].upper()}"
        
        print(f"{result['spot_name']:<15} {overall_display:<12} {beginner_display:<12} {intermediate_display:<12} {advanced_display:<12}")
    
    print("-"*80)
    
    # Count by risk level
    print("\n" + "="*80)
    print("RISK LEVEL DISTRIBUTION")
    print("="*80)
    
    for skill in ['beginner', 'intermediate', 'advanced']:
        high_count = sum(1 for r in results if r[skill]['level'] == 'High')
        medium_count = sum(1 for r in results if r[skill]['level'] == 'Medium')
        low_count = sum(1 for r in results if r[skill]['level'] == 'Low')
        
        print(f"\n{skill.capitalize()}:")
        print(f"  🔴 High Risk: {high_count} spots")
        print(f"  🟡 Medium Risk: {medium_count} spots")
        print(f"  🟢 Low Risk: {low_count} spots")

if __name__ == '__main__':
    print("="*80)
    print("SKILL-BASED SURF RISK ANALYZER WITH CUSTOM THRESHOLDS")
    print("="*80)
    
    # Generate summary report
    generate_risk_summary()
    
    # Update database
    update_database_with_skill_risks()
    
    print("\n✅ All operations completed successfully!")
    print("="*80)
    
    client.close()