/*
 *  Copyright 2015-2022 Felix Garcia Carballeira, Alejandro Calderon Mateos, Javier Prieto Cepeda, Saul Alonso Monsalve
 *
 *  This file is part of WepSIM.
 *
 *  WepSIM is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  WepSIM is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with WepSIM.  If not, see <http://www.gnu.org/licenses/>.
 *
 */


    //
    // General popover
    //

    function wepsim_popover_init_OLD ( popover_id, popover_cfg, fun_ownshown )
    {
         var obj1 = document.querySelector(popover_id) ;
         if (null == obj1) {
             return null ;
         }

	 var po1 = $(popover_id).popover(popover_cfg) ; 
                   po1.on('shown.bs.popover',
		           function(shownEvent) {
                               fun_ownshown(shownEvent);
                               i18n_update_tags('dialogs') ;
                               i18n_update_tags('gui') ;
                               i18n_update_tags('cfg') ;
                           }) ;
         return po1 ;
    }

    function wepsim_popover_init ( popover_id, popover_cfg, fun_ownshown )
    {
         var obj1 = document.querySelector(popover_id) ;
         if (null == obj1) {
             return null ;
         }

	 var po1 = new bootstrap.Popover(obj1, popover_cfg) ;
         obj1.addEventListener('shown.bs.popover',
		               function(shownEvent) {
                                    fun_ownshown(shownEvent) ;
                                    i18n_update_tags('dialogs') ;
                                    i18n_update_tags('gui') ;
                                    i18n_update_tags('cfg') ;
                               }) ;
         return po1 ;
    }

    function wepsim_popover_show ( popover_id )
    {
         $('#' + popover_id).popover('show') ;
    }

    function wepsim_popover_hide ( popover_id )
    {
         $('#' + popover_id).popover('hide') ;
    }

    function wepsim_popover_action ( popover_id, action )
    {
         $('#' + popover_id).popover(action) ;
    }

    function wepsim_popovers_hide ( popovers_id )
    {
         $(popovers_id).popover('hide') ;
    }

