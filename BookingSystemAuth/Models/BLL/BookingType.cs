﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace BookingSystemAuth.Models
{
    public class BookingType
    {
        [Required(ErrorMessage = "BookingTypeId is required.")]
        [Range(0, Int16.MaxValue, ErrorMessage = "BookingTypeId is out of range.")]
        public int BookingTypeId { get; set; }

        [Required(ErrorMessage = "Name is required.")]
        [StringLength(50, ErrorMessage = "Name must not exceed 50 chars.")]
        [RegularExpression(ValidationExtensions.TEXT_FIELD_REGEXP, ErrorMessage = "Name must be alphanumeric and may also contain the following chars: &_-.,@")]
        public string Name { get; set; }

        // Extra datafields retrieved from database/stored procedure
        public int BookingTypeCount { get; set; }
    }
}