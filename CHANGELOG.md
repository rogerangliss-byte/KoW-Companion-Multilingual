# Changelog

## v4.3.25 Multilingual Release
- Dedicated Multilingual release branch.
- English, Italian, French and German language resources included.
- Removed TEST banner and normalised versioning to v4.3.25.
- Added final French/German residual status translations.

## v4.3.11 TEST
- Fixed Italian -> English switching by restoring a pristine English UI before every language change.
- Language preference now uses a stable version-independent `kow_language` setting.
- Existing older language settings are migrated on startup.
- Selecting English immediately restores the complete interface to English.
- Reset Appearance / Reset App restores English as the default and clears old language-version keys.
- Expanded Italian coverage for remaining reported labels and status strings.
- Dynamic Dashboard/Forecast content is recalculated and translated after language changes.
- Officer names and game/database values remain unchanged.
- TEST only until English <-> Italian switching and full Italian coverage are approved.

## v4.3.9 TEST
- Completed a much deeper Italian translation pass.
- Added translation of dynamic JavaScript-generated status/result text, not just static page labels.
- Added live MutationObserver translation so recalculated Smart Dashboard, Optimiser, Planner and Release content remains Italian after updates.
- Expanded Italian Help/User Guide text shown inside the app.
- Expanded resource-table, status, month, release, goal and selection wording.
- Officer names and numeric game data remain unchanged.
- English remains the default/fallback.
- French, German and Spanish are still partial and should not be promoted as complete until brought to the same coverage level.
- v4.3.6 remains LIVE while multilingual support is tested.

## v4.3.8 TEST
- Expanded multilingual system so the selected language applies across the whole visible UI, not only selected headings/navigation.
- Added broad Italian translation coverage for Settings, Releases, Forecast, Officer, Stars, Development, XP, Planner, Database, Help labels and controls.
- Added translation handling for dynamic Future Officer Forecast output.
- Added whole-page text/placeholder/option translation pass.
- Officer names, game values and numeric calculations remain unchanged.
- English remains the fallback for any text not yet translated.
- v4.3.6 remains LIVE while full multilingual behaviour is tested.

## v4.3.7 TEST
- Added Language selector to Settings.
- Initial languages: English, French, German, Spanish and Italian.
- Language selection is saved automatically on the device.
- Added translation framework with English fallback for missing translation keys.
- Initial translation coverage includes navigation, Smart Dashboard, Future Officer Forecast and key save/reset controls.
- Officer names and game/database values remain unchanged.
- Calculations and saved Officer/resource data are unaffected by language selection.
- v4.3.6 remains LIVE while multilingual support is tested.

## v4.3.6 LIVE
- Added Future Officer Cost Forecast to Releases.
- Forecast is based on Officer release sequence, not Officer role pricing.
- Uses latest known S7 Tank Destroyer benchmark: 600 ORV per Badge / 300 SRV per Exclusive Star.
- Defaults to 20% estimated cost growth for each future Officer release.
- Includes October S8 Rally/Garrison, January S8 Infantry, April S8 Tanks and July S8 Tank Destroyer forecasts.
- User can alter forecast growth rate, Badge requirement and Star value requirement.
- Calculates projected ORV per Badge, SRV per Exclusive Star, total ORV for Badges and total SRV for Stars.
- Estimates are clearly labelled forecasts until confirmed game costs are published.
- Approved TEST build promoted to LIVE.

## v4.3.5 LIVE
- Fixed Officer switching so shared resource inventories remain populated.
- Split saved data into:
  - Officer-specific progress: Star levels, unlock/skills/training, Officer Badges held, current/target XP level, Planner goal.
  - Global shared inventory: Legendary Star I/II/III, SRV, Universal Legendary Badges, Selection Chests, ORV and XP Books.
- Changing Officer now changes only Officer-specific progress.
- Shared resources persist across every Officer.
- Reset This Officer does not clear shared resource inventory.
- Added migration from v4.3.4 Officer profiles and the earlier legacy single save.
- v4.3.3 remains the LIVE baseline while this TEST build is checked.

## v4.3.4 TEST
- Added a separate persistent progress profile for every Officer.
- Officer switching automatically saves the Officer being left and loads the selected Officer's profile.
- Added `Save This Officer` and `Reset This Officer` controls.
- Saved profile covers Stars, Development, XP Books/levels and Planner goal.
- Added one-time migration of the previous single saved-progress record.
- Existing full Backup & Restore automatically includes the new Officer profiles.
- LIVE v4.3.3 remains untouched while this feature is tested.

## v4.3.3 LIVE
- Fixed Smart Dashboard not populating.
- Corrected an invalid Officer reference that stopped the Dashboard updater.
- Smart Dashboard now mirrors the app's existing authoritative MAX Officer results:
  - Development from `dashBadgesRequired`
  - Stars from `dashStarsRequired`
  - XP from `dashXpRequired`
- Reads the real active Officer from the Officer selector.
- Reads saved Multi-Officer plans from the correct saved-plan control.
- Upcoming Release now populates from the recurring release calendar.
- Dashboard refreshes after every normal calculator calculation and whenever Home is opened.
- No duplicate Home resource inputs were added.
- Approved TEST build promoted to LIVE.
- Red TEST VERSION banner removed.

## v4.3.2 TEST
- Fixed Smart Dashboard population.
- Dashboard now reads the existing saved Officer/resource state instead of requiring separate Home inputs.
- Development reads held badges, shared badge resources and ORV conversion for the active Officer.
- Stars and XP use the app's calculated requirement/remaining values.
- Can I Max This Officer? now reflects Development + Stars + XP.
- Next Upgrade Plan reads the selected/saved Multi-Officer plan.
- Upcoming Release is populated automatically from the recurring annual release cycle.
- Added automatic dashboard refresh after restored saved data and user changes.
- v4.3.0 remains the Live baseline until this test build is approved.

## v4.3.1 TEST
- Added Smart Dashboard to Home.
- Added READY TO MAX / PARTIALLY READY / RESOURCES REQUIRED status.
- Added Development, Stars and XP readiness summaries.
- Added Can I Max This Officer? status.
- Added saved upgrade-plan summary.
- Added current/upcoming recurring release summary.
- Added limiting-resource guidance.
- v4.3.0 remains the Live baseline while this build is tested.

## v4.3.0 LIVE
- Added Multi-Officer Upgrade Planner.
- Add multiple Officers and arrange upgrade priority.
- Set badge requirements per Officer.
- Preview shared ORV, Universal Legendary Badges and Selection Chest allocation.
- Shows Fully Funded, Partially Funded and Shortfall status.
- Save, load and delete named upgrade plans locally.
- Planner is preview-only and does not alter normal saved calculator resources.
- v4.3.0 is the Live baseline.

# v4.3.0 LIVE
- Bottom navigation now uses one 10-item row.
- Reduced navigation spacing and label size to prevent Help wrapping to a second line.
- No calculator or database logic changed.

# v4.2.15 TEST
- Added recurring August–July Release Calendar page.
- Automatically highlights current month and shows next scheduled release.
- No changes to the 56-officer master set.

# Changelog

## v4.2.15 LIVE
- Promoted the approved v4.2.15 TEST build to Live.
- Officer Upgrade Summary available on the Officer tab.
- Resource Optimiser supports comparison with a second Officer.
- Comparison displays ORV-per-badge efficiency and suggested resource strategy.
- Backup & Restore available in Settings.
- Help and User Guide updated for v4.2.15.
- TEST banner removed.
- No Officer portrait files included in this deployment package.
