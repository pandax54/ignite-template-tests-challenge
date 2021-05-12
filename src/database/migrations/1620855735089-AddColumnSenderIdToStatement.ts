import {MigrationInterface, QueryRunner, TableColumn, TableForeignKey} from "typeorm";

export class AddColumnSenderIdToStatement1620855735089 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("statements",
        new TableColumn({
          name: "sender_id",
          type: "uuid",
          isNullable: true
        })
      );

      await queryRunner.changeColumn("statements", "type",
        new TableColumn({
          name: 'type',
          type: 'enum',
          enum: ['deposit', 'withdraw', 'transfer']
        })
      )

      await queryRunner.createForeignKey("statements", new TableForeignKey({
        name: "FKUserSenderStatements",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        columnNames: ["sender_id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey("statements", "FKUserSenderStatements")
        await queryRunner.changeColumn("statements", "type", new TableColumn({
          name: 'type',
            type: 'enum',
            enum: ['deposit', 'withdraw']
        }));
        await queryRunner.dropColumn("statements", "sender_id")
    }

}
