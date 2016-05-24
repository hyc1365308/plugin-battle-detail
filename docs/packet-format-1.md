# Poi Battle Packet Standard

## Necessary data

The following keys MUST be copied, if present in the API.

    api_ship_ke
    api_nowhps
    api_maxhps
    api_nowhps_combined
    api_maxhps_combined
    api_search
    api_formation
    api_kouku
    api_kouku2
    api_support_info
    api_opening_atack
    api_hougeki1
    api_hougeki2
    api_hougeki3
    api_raigeki
    api_hougeki

The following keys MUST be present in the packet.

    poi_is_combined         # true=Combined fleet, false=Normal fleet
    poi_is_carrier          # true=Carrier Task Force, false=Surface Task Force
    poi_sortie_fleet        # Organization of sortied fleet. Values are `api_id` of api_start2.api_mst_ships
    poi_sortie_equipment    # Equipments of sortied fleet. Values are `api_id` of api_start2.api_mst_slotitem
    poi_combined_fleet      # Organization of combined escort fleet.
    poi_combined_equipment  # Equipments of combined escort fleet.

## Optional data

The following keys are RECOMMENDED in the packet.

    poi_uri         # The URI of battle API request.
    poi_timestamp   # When did the battle happens. (millisecond from 1970-01-01T00:00:00Z)
    poi_comment     # A comment describing the battle, e.g. "Sortie 2-3 A", "Pratice Tanaka (Lv.120)"

## Sample
This is a sample battle packet that can be parsed by this plugin.
```json
{"api_dock_id":1,"api_ship_ke":[-1,512,511,510,510,513,513],"api_ship_lv":[-1,1,1,1,1,1,1],"api_nowhps":[-1,19,13,14,-1,-1,-1,85,90,65,65,70,70],"api_maxhps":[-1,19,14,14,-1,-1,-1,85,90,65,65,70,70],"api_midnight_flag":1,"api_eSlot":[[519,523,516,-1,-1],[509,512,525,-1,-1],[519,523,516,-1,-1],[519,523,516,-1,-1],[-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1]],"api_eKyouka":[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],"api_fParam":[[14,84,0,19],[9,79,0,18],[9,69,0,19],[0,0,0,0],[0,0,0,0],[0,0,0,0]],"api_eParam":[[0,0,30,40],[65,0,70,70],[0,0,15,25],[0,0,15,25],[0,0,0,10],[0,0,0,10]],"api_search":[6,1],"api_formation":[1,3,2],"api_stage_flag":[1,1,1],"api_kouku":{"api_plane_from":[[-1],[7,9,10]],"api_stage1":{"api_f_count":0,"api_f_lostcount":0,"api_e_count":189,"api_e_lostcount":0,"api_disp_seiku":4,"api_touch_plane":[-1,-1]},"api_stage2":{"api_f_count":0,"api_f_lostcount":0,"api_e_count":126,"api_e_lostcount":6},"api_stage3":{"api_frai_flag":[-1,0,0,0,0,0,0],"api_erai_flag":[-1,0,0,0,0,0,0],"api_fbak_flag":[-1,0,0,0,0,0,0],"api_ebak_flag":[-1,0,0,0,0,0,0],"api_fcl_flag":[-1,0,0,0,0,0,0],"api_ecl_flag":[-1,0,0,0,0,0,0],"api_fdam":[-1,0,0,0,0,0,0],"api_edam":[-1,0,0,0,0,0,0]}},"api_support_flag":0,"api_support_info":null,"api_opening_flag":1,"api_opening_atack":{"api_frai":[-1,2,4,4,0,0,0],"api_erai":[-1,0,0,0,0,0,0],"api_fdam":[-1,0,0,0,0,0,0],"api_edam":[-1,0,33,0,134,0,0],"api_fydam":[-1,33,92,42,0,0,0],"api_eydam":[-1,0,0,0,0,0,0],"api_fcl":[-1,1,2,1,0,0,0],"api_ecl":[-1,0,0,0,0,0,0]},"api_hourai_flag":[0,0,0,1],"api_hougeki1":null,"api_hougeki2":null,"api_hougeki3":null,"api_raigeki":{"api_frai":[-1,3,6,5,0,0,0],"api_erai":[-1,0,0,0,0,0,0],"api_fdam":[-1,0,0,0,0,0,0],"api_edam":[-1,0,0,64,0,57.1,66.1],"api_fydam":[-1,64,66,57,0,0,0],"api_eydam":[-1,0,0,0,0,0,0],"api_fcl":[-1,1,1,1,0,0,0],"api_ecl":[-1,0,0,0,0,0,0]},"poi_is_combined":false,"poi_is_carrier":false,"poi_sortie_fleet":[400,191,127,null,null,null],"poi_sortie_equipment":[[15,15,null,null,null,null],[15,null,null,null,null,null],[15,null,null,null,null,null]],"poi_combined_fleet":[],"poi_combined_equipment":[],"poi_is_water":true,"poi_uri":"/kcsapi/api_req_sortie/battle","poi_timestamp":1445252829039,"poi_comment":"出击 2-3 (3)","api_hougeki":{"api_at_list":[-1,1,2,3],"api_df_list":[-1,[11,11],[9],[12]],"api_si_list":[-1,[15,15],[15],[15]],"api_cl_list":[-1,[1,1],[1],[1]],"api_sp_list":[-1,3,0,0],"api_damage":[-1,[168,169],[70],[76]]}}
```