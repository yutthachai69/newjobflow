/**
 * Reusable Prisma query includes and helpers
 * เพื่อลด code duplication และทำให้ queries สม่ำเสมอ
 */

// ==========================================
// Location Hierarchy Includes
// ==========================================

/**
 * Include สำหรับ Asset พร้อม Location hierarchy
 */
export const assetWithLocation = {
  room: {
    include: {
      floor: {
        include: {
          building: {
            include: {
              site: {
                include: {
                  client: true,
                },
              },
            },
          },
        },
      },
    },
  },
} as const

/**
 * Include สำหรับ Site พร้อม Client
 */
export const siteWithClient = {
  site: {
    include: {
      client: true,
    },
  },
} as const

/**
 * Include สำหรับ WorkOrder พร้อม Site และ Client
 */
export const workOrderWithSite = {
  workOrder: {
    include: {
      site: {
        include: {
          client: true,
        },
      },
    },
  },
} as const

/**
 * Include สำหรับ JobItem พร้อม Asset location และ WorkOrder
 */
export const jobItemWithDetails = {
  asset: {
    include: {
      room: {
        include: {
          floor: {
            include: {
              building: {
                include: {
                  site: {
                    include: {
                      client: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  workOrder: {
    include: {
      site: {
        include: {
          client: true,
        },
      },
    },
  },
  technician: true,
  photos: true,
} as const

/**
 * Include สำหรับ WorkOrder พร้อม JobItems และ Asset locations
 */
export const workOrderWithJobItems = {
  site: {
    include: {
      client: true,
    },
  },
  jobItems: {
    include: {
      asset: {
        include: {
          room: {
            include: {
              floor: {
                include: {
                  building: {
                    include: {
                      site: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      technician: true,
      photos: true,
    },
  },
} as const

/**
 * Include สำหรับ Location hierarchy แบบเต็ม (Client → Site → Building → Floor → Room)
 */
export const fullLocationHierarchy = {
  sites: {
    include: {
      client: true,
      buildings: {
        include: {
          floors: {
            include: {
              rooms: {
                include: {
                  _count: {
                    select: { assets: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const

// ==========================================
// Helper Functions
// ==========================================

/**
 * สร้าง location path string จาก Asset
 */
export function getAssetLocationPath(asset: {
  room: {
    floor: {
      building: {
        site: { name: string; client: { name: string } }
        name: string
      }
      name: string
    }
    name: string
  }
}): string {
  const { room } = asset
  return `${room.floor.building.site.name} → ${room.floor.building.name} → ${room.floor.name} → ${room.name}`
}

/**
 * สร้าง location path string จาก JobItem
 */
export function getJobItemLocationPath(jobItem: {
  asset: {
    room: {
      floor: {
        building: {
          site: { name: string; client: { name: string } }
          name: string
        }
        name: string
      }
      name: string
    }
  }
}): string {
  const { asset } = jobItem
  return getAssetLocationPath(asset)
}
