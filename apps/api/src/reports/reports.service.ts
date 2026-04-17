import { Injectable, NotFoundException } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async activityRosterBuffer(activityId: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id: activityId, deletedAt: null },
    });
    if (!activity) throw new NotFoundException('Activity not found');
    const rows = await this.prisma.registration.findMany({
      where: { activityId, deletedAt: null },
      include: { student: true, attendances: true },
    });
    const wb = new Workbook();
    const ws = wb.addWorksheet('Roster');
    ws.columns = [
      { header: 'Student Code', key: 'code', width: 14 },
      { header: 'Name', key: 'name', width: 28 },
      { header: 'Faculty', key: 'faculty', width: 22 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Attendance', key: 'att', width: 18 },
    ];
    for (const r of rows) {
      ws.addRow({
        code: r.student.studentCode,
        name: `${r.student.firstName} ${r.student.lastName}`,
        faculty: r.student.faculty,
        status: r.status,
        att: r.attendances[0]?.status ?? '',
      });
    }
    const buf = await wb.xlsx.writeBuffer();
    return Buffer.from(buf);
  }
}
