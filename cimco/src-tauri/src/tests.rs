use super::ScaleData;

#[test]
fn test_scale_ramping_up() {
    let mut scale = ScaleData {
        current_weight: 0,
        target_weight: 10000, // User requested 10,000 lbs
        is_stable: false,
    };

    // First update should increase weight by 500 (plus jitter [-20, 20])
    let weight = scale.update();
    // 500 - 20 = 480, 500 + 20 = 520. We allow slightly more buffer just in case.
    assert!(weight >= 470 && weight <= 530, "Weight with jitter should be ~500, got {}", weight);
    
    // Loop until we reach target (should take ~20 steps)
    let mut steps = 1;
    while scale.current_weight < 10000 {
        scale.update();
        steps += 1;
        if steps > 100 { panic!("Scale simulation stuck! Took too many steps."); }
    }

    assert_eq!(scale.current_weight, 10000);
    assert!(steps >= 20, "Should take at least 20 steps (500lbs/step) to reach 10,000");
}

#[test]
fn test_scale_ramping_down() {
    let mut scale = ScaleData {
        current_weight: 1000,
        target_weight: 0,
        is_stable: false,
    };

    scale.update();
    assert_eq!(scale.current_weight, 500);

    scale.update();
    assert_eq!(scale.current_weight, 0);
}

#[test]
fn test_scale_stability() {
    let mut scale = ScaleData {
        current_weight: 5000,
        target_weight: 5000,
        is_stable: true,
    };

    // When stable (current == target), there should be NO jitter
    let weight = scale.update();
    assert_eq!(weight, 5000);
}
