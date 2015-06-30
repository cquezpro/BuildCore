Roles and permissions
=====================

bill-Sync application is multi-user.  Customers may create multiple accounts
and customize their access.

Authorization is implemented with [CanCanCan][ccc] gem.  See its
exhaustive [wiki][ccc-wiki] for more information.

Definitions
-----------

Following models are involved in authorization process.

1.  User &mdash; Represents company.
1.  Individual &mdash; Represents authenticable account belonging to User,
    that is sign in credentials, contact, personal details and some of scoping
    limits.
1.  Ability &mdash; Defines what given individual can do and what he cannot.
    This model responds to `#can?` and `#cannot?` methods and should be the
    only model directly involved in authorization process. This model is not
    persisted.
1.  Permission &mdash; Action to be performed and resource name on which it can be peformed.
1.  Role &mdash; Named set of permissions.  Every Individual is assigned to some
    Role.
1.  Vendor, Account, QBClass &mdash; Individual's access can be scoped to some
    set of records.

Authorization logic
-------------------

### Permissions

Permissions reflect all the actions which Individual can perform and which
require authorization.

Permission can be described as a two-element tuple consisting of action name
and resource name.  Action name is always a Symbol.  Resource name can be either
a Class or Symbol.  Both items have exactly the same meaning as two first
parameters passed to `#can` method, see [CanCanCan wiki][ccc-def].

Some action names have special meaning.  One example is `:manage`, which is
a CanCanCan's wildcard for every possible action (again, [wiki][ccc-def]).
Some are aliases: `:crud` matches all of `:create`, `:read`, `:update`
and `:destroy` actions.  Aliases are all defined in Ability model, see
[`Ability#apply_aliases`][bs-ability].

As it was mentioned before, resource name can be either a Class or Symbol.
If it's class, then given permission is applied to any instance of that Class.
For example, permission `[:read, Vendor]` allows reading any Vendor.
Symbol can be used when given resource does not correspond to any model.
For example, `[:read, :today]` allows accessing today view (aka. dashboard).
As in action names, there's also a wildcard: `:all` makes permission working
with every resource, either described by Class or another Symbol.

Furthermore, there are several permissions called as "overrides".  They work
in a bit unusual way: they imply yet another permissions, usually with
additional conditions.  One example is `[:read_incomplete, Invoice]` which
imply `[:read, Invoice]` but with some restrictions on `Invoice#status`.
Overrides are less clear than other permissions and generally discouraged
and should be only used when required effect cannot be achieved with action
name aliases.  They are defined in [`Ability#apply_rule_overrides`][bs-ability].

All available permissions are defined in [`Permission::ALL`][bs-permission]
Array.  Every permission has name which is actually its action and resource name
joined with dash (`-`), for example `read-Invoice` for `[:read, Invoice]`
and `read-today` for `[:read, :today]`.  These names are recognized by
the frontend.

### Role

Role is a named set of permissions.  Every Individual is associated with one
and only one Role.  Assigning a Role is the only way to set or unset permissions
of Individual.

There are several stock Roles available to all Users.  They're all defined
in a [`static_records:stock_roles` Rake task][bs-stock-roles] which can be run
to create them.  Notably there's an "Administrator" Role which grants all
permissions.

Apart from stock Roles, Users may create custom ones with.  They cannot create
custom Permissions though, they're limited to members of
[`Permission::ALL`][bs-permission] Array.  Custom roles are not shared among
Users.

### Scope

Individual's access rights can be further refined by scoping &mdash; yet another
thing separate from Permissions and Roles and applicable only to Invoices.

There are two kinds of scoping:

1.  Invoice amount &mdash; Individuals may be restricted to Invoices of
    `#amount_due` within specified range.
1.  Vendor, Account, QBClass &mdash; Individuals may be restricted to Invoices
    associated with specified Vendors, Accounts or QBClasses.

The latter case requires more explanation.  When Individual is scoped in any
of those models, then his access is limited only to Invoices associated with
records specified in that scoping.  For example, when given Individual is scoped
to Vendor *A*, he cannot access Invoices associated with Vendor *B* neither
those not assigned to any Vendor.

Individual is allowed to perform an action on Invoice only when both conditions
are met: he has applicable permission and given Invoice fits scoping.

### Ability

Ability is the core of CanCanCan-powered authorization.  It is instantiated
with Individual instance

It is instantiated with Individual instance and provides `#can?` and `#cannot?`
methods which can be used to check whether given action is allowed.

If you check other models in authorization, you probably do it wrong.

### Controllers

CanCanCan brings several convenience methods to ActionController.  It is seldom
required to call `#can?` directly as `#authorize!`, `::authorize_resource`
and `::load_and_authorize_resource` fit most needs.  Using CanCanCan
in controllers is very extensively covered on several of [wiki pages][ccc-wiki].

CanCanCan nicely integrates with [Inherited Resources][ccc-ir].  Most notably it
enhances `::load_resource` so that `#collection` is already scoped according to
on what records `#current_ability` can operate.  It works more less like this:

    relation.accessible_by current_ability, params[:action]

As a consequence, `#collection` may be blank in some actions. There are
[aliases defined for REST actions][ccc-aliases].  For example, `:show`
translates to `:read`, so that `ability.can? :read, *args` implies
`ability.can? :show, *args`.  For actions of non-restful names, either specify
correct aliases in `Ability#apply_aliases` or stop using `::load_resource`,
`::load_and_authorize_resource` and `#collection`.

Another integration which may come handy is Strong Parameters.  See
[wiki][ccc-strong].

Rake tasks
----------

Convenient rake task `static_records:stock_roles` creates or updates stock
roles.  Please note that this task will overwrite updated Roles but possibly
will not delete removed ones, that may require additional clean up.

Testing
-------

### Request specs

For convenience, `#as` helper method has been defined.  It is available in
example groups of request specs and should be called with a Symbol which
indicates method which returns Individual.

All requests in the example group will be made with that Individual signed in.
See example:

    describe "some requests" do

      let(:some_individual) { create :individual }

      as(:some_individual)

      example "GET /some/path" do
        get "some/path" # perform GET request as some_individual
      end

    end

Be advised of the fact that this helper method stubs
`Api::V1::CoreController#current_individual`.  Stubbing in request specs is
quite controversial and should be avoided, however it was *really* difficult
to make it in a different way.

Unless `#as` is called in some example group, Individuals are not authenticated
in requests.

### Stock roles

Stock roles are always available in tests in their most current definitions.
To access them, you need to search them by name
(`Role.stock.find_by_name("Administrator")`).

Anyway, all new individuals are administrators by default so you won't have to
resort to this technique very often.

### Custom roles

Sometimes, for example at authorization tests, it's better not to rely on stock
roles but to create a custom role instead.  Such role should be limited to
tested permissions only.  It is as simple as:

    describe "some permission tests" do
      let(:custom_role) { create :role, permissions: %w[read-today] }
      let(:individual) { create :individual, role: custom_role }
    end

Permissions in Web Frontend
---------------------------

In Frontend the authorization process checks whether user's current permissions allow him to access particular page or make particular action. If user does not have access then either he is redirected to error page or the elements required for making action are hidden. This approach is not completely safe, it just accompanies the Backend authorization.

The main frontend authorization file is *authorize.js*. Basically it has a list of permissions, each of them containing list of permitted views, `ui-router` states and actions. Also there are three functions with names `view`, `state` and `action`. They take particular view, state or action respectively also a user's permission list as parameters and return `true` or `false` value depending on whether that view, state or action can be accessed with user's current permissions. These 3 functions have a global wrapper functions in *app.js* file with names `authorizeView`, `authorizeState` and `authorizeAction`.

Everytime when ui-router's `$stateChangeStart` event is triggered, the view which is going to be open is checked with `authorizeView` function for permission. If it doesn't have enough permission, app is redirected to Error page.

Links are checked with Angular's `ng-if` directive and `authorizeState` function. For example: `ng-if="authorizeState('profile')"`, which will only create a link if permission for `profile` state is given to user.

Buttons and other elements that trigger some action are checked with `authorizeAction` function and `ng-if` directive. For example: `ng-if="authorizeAction('delete-bill')"` will show Delete button only if user has permission for deleting bills.

Generally it's up to developer how to restrict access to Frontend's parts. He can hide buttons or redirect to error page or just do nothing when user clicks something. For now when user don't have access to view or state he is redirected to error page, and when he's not allowed to do particular action the element related to that action is hidden.

Permissions in Mobile App
-------------------------

Permissions in Mobile are almost the same as in Web Frontend, except differences caused by different structure of mobile app. They include different folder structure, other state names, file names and also different elements in pages. So mobile app's *authorize.js* file is filled with other information. Please read *Permissions in Web Frontend* section above to understand how authorization works.

Future changes
--------------

Several design goals were not achieved in current implementation for various
reasons.

1.  User and Individual should be renamed to Company and User, respectively.
    It is a very radical change for application as whole.  Due to limited test
    coverage we've restrained from such extensive refactoring.
1.  User-defined roles are not available yet.  Most (if not all) required
    backend work is complete though.
1.  Individual model holds personal data, authentication credentials
    and permission limits and scoping.  Mixing many loosely related concepts
    in a single model may become constraining at some point.
1.  Currently Ability cannot be instantiated with `nil` instead of Individual
    instance.

Current implementation can be improved in many areas.

[bs-ability]: https://github.com/vkbrihma/BillSyncV7/blob/master/app/models/ability.rb
[bs-permission]: https://github.com/vkbrihma/BillSyncV7/blob/master/app/models/permission.rb
[bs-stock-roles]: https://github.com/vkbrihma/BillSyncV7/blob/master/lib/tasks/static_records.rake
[ccc]:      https://github.com/CanCanCommunity/cancancan/
[ccc-aliases]:  https://github.com/CanCanCommunity/cancancan/wiki/Action-Aliases
[ccc-def]:  https://github.com/CanCanCommunity/cancancan/wiki/Defining-Abilities
[ccc-ir]:   https://github.com/CanCanCommunity/cancancan/wiki/Inherited-Resources
[ccc-strong]: https://github.com/CanCanCommunity/cancancan/wiki/Strong-Parameters
[ccc-wiki]: https://github.com/CanCanCommunity/cancancan/wiki
[ir]:       https://github.com/josevalim/inherited_resources
