import logging

logger = logging.getLogger(__name__)

def generate_pre_match_explanation(
    team1, team2, venue, toss_winner, toss_decision,
    head_to_head_win_rate, team1_venue_win_rate, team2_venue_win_rate,
    team1_form, team2_form, predicted_winner, team1_probability
):
    """
    Generates a SHAP-style list of feature contributions to explain why
    the model favored one team over the other.
    """
    contributions = []
    
    # We explain the prediction relative to the predicted winner.
    is_team1_winner = predicted_winner == team1
    prob = team1_probability if is_team1_winner else (1.0 - team1_probability)
    
    target_team = team1 if is_team1_winner else team2
    opponent_team = team2 if is_team1_winner else team1
    
    # 1. Head-to-Head contribution
    # Map head-to-head from target team's perspective
    target_h2h = head_to_head_win_rate if is_team1_winner else (1.0 - head_to_head_win_rate)
    h2h_diff = target_h2h - 0.5
    if abs(h2h_diff) > 0.02:
        weight = h2h_diff * 0.45  # Head-to-head weight scaling
        pct = int(round(weight * 100))
        if pct > 0:
            contributions.append({
                "feature": "Head-to-Head Record",
                "impact": f"+{pct}%",
                "type": "positive",
                "description": f"Historical dominance over {opponent_team} ({int(target_h2h * 100)}% wins)"
            })
        elif pct < 0:
            contributions.append({
                "feature": "Head-to-Head Record",
                "impact": f"{pct}%",
                "type": "negative",
                "description": f"Lower historical success rate against {opponent_team}"
            })

    # 2. Venue win rate contribution
    target_venue_wr = team1_venue_win_rate if is_team1_winner else team2_venue_win_rate
    opp_venue_wr = team2_venue_win_rate if is_team1_winner else team1_venue_win_rate
    venue_diff = target_venue_wr - opp_venue_wr
    if abs(venue_diff) > 0.02:
        weight = venue_diff * 0.35  # Venue familiarity weight scaling
        pct = int(round(weight * 100))
        if pct > 0:
            contributions.append({
                "feature": "Venue Familiarity",
                "impact": f"+{pct}%",
                "type": "positive",
                "description": f"Higher win rate at {venue} ({int(target_venue_wr * 100)}% vs {int(opp_venue_wr * 100)}%)"
            })
        elif pct < 0:
            contributions.append({
                "feature": "Venue Familiarity",
                "impact": f"{pct}%",
                "type": "negative",
                "description": f"Slightly weaker track record at {venue} compared to {opponent_team}"
            })

    # 3. Form contribution
    target_form = team1_form if is_team1_winner else team2_form
    opp_form = team2_form if is_team1_winner else team1_form
    form_diff = target_form - opp_form
    if abs(form_diff) > 0.02:
        weight = form_diff * 0.30  # Recent form scaling
        pct = int(round(weight * 100))
        if pct > 0:
            contributions.append({
                "feature": "Recent Form",
                "impact": f"+{pct}%",
                "type": "positive",
                "description": f"Better momentum in recent matches (win rate of {int(target_form * 100)}% vs {int(opp_form * 100)}%)"
            })
        elif pct < 0:
            contributions.append({
                "feature": "Recent Form",
                "impact": f"{pct}%",
                "type": "negative",
                "description": f"Less momentum in recent matches compared to {opponent_team}"
            })

    # 4. Toss contribution
    if toss_winner == target_team:
        decision_text = "fielding first" if toss_decision.lower() == "field" else "batting first"
        contributions.append({
            "feature": "Toss Advantage",
            "impact": "+4%",
            "type": "positive",
            "description": f"Won the toss and chose to set up the game by {decision_text}"
        })
    else:
        contributions.append({
            "feature": "Toss Disadvantage",
            "impact": "-3%",
            "type": "negative",
            "description": f"Lost the toss; forced to adapt to {opponent_team}'s choice to {toss_decision}"
        })

    # Sort contributions so positive impacts are listed first
    contributions = sorted(contributions, key=lambda x: (x["type"] == "negative", -abs(float(x["impact"].replace('%', '').replace('+', '')))))
    
    # Generate structured summary text
    summary = f"{target_team} is favored with a {int(prob * 100)}% chance of winning, primarily driven by "
    positives = [c["feature"].lower() for c in contributions if c["type"] == "positive"]
    if positives:
        summary += "their stronger " + ", ".join(positives[:-1]) + (" and " + positives[-1] if len(positives) > 1 else positives[0]) + "."
    else:
        summary += "toss settings and general balanced team index."
        
    return {
        "predicted_winner": target_team,
        "probability": float(prob),
        "summary": summary,
        "contributions": contributions
    }
